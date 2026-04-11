package com.skillsync.user.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skillsync.user.dto.request.UpdateProfileRequestDto;
import com.skillsync.user.dto.response.UserProfileResponseDto;
import com.skillsync.user.entity.UserProfile;
import com.skillsync.user.exception.UserProfileNotFoundException;
import com.skillsync.user.mapper.UserProfileMapper;
import com.skillsync.user.repository.UserProfileRepository;
import com.skillsync.user.service.UserProfileService;
import com.skillsync.user.client.AuthClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@CacheConfig(cacheNames = "user")
public class UserProfileServiceImpl implements UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserProfileMapper userProfileMapper;
    private final AuthClient authClient;
    private final com.skillsync.user.repository.AuditLogRepository auditLogRepository;
    private final com.skillsync.user.repository.AdminNotificationRepository notificationRepository;
    private final org.springframework.mail.javamail.JavaMailSender mailSender;

    @Override
    @Cacheable(key = "'userId_' + #userId")
    public UserProfileResponseDto getProfileByUserId(Long userId) {
        log.info("Cache MISS - fetching profile for userId={} from DB", userId);
        return userProfileRepository.findByUserId(userId)
                .map(userProfileMapper::toDto)
                .orElseGet(() -> {
                    log.warn("User profile not found for userId: {}. Returning default placeholder.", userId);
                    // Standard User 1 is Admin/System
                    String name = (userId == 1) ? "Admin" : "User " + userId;
                    String email = (userId == 1) ? "admin@skillsync.com" : "user" + userId + "@skillsync.com";

                    UserProfileResponseDto placeholder = new UserProfileResponseDto();
                    placeholder.setUserId(userId);
                    placeholder.setUsername(name);
                    placeholder.setName(name);
                    placeholder.setEmail(email);
                    placeholder.setBio("I am a " + name + " in SkillSync");
                    return placeholder;
                });
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(key = "'userId_' + #userId"),
            @CacheEvict(key = "'email_' + #result.email", condition = "#result != null")
    }, put = {
            @CachePut(key = "'userId_' + #userId")
    })
    public UserProfileResponseDto updateProfile(Long userId, UpdateProfileRequestDto requestDto) {
        log.info("Updating profile for userId: {}", userId);
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new UserProfileNotFoundException(
                        "User profile not found for userId: " + userId));

        String oldUsername = profile.getUsername();
        userProfileMapper.updateEntity(profile, requestDto);
        UserProfile updated = userProfileRepository.save(profile);

        // ── Sync with Auth Service if username changed ──
        if (requestDto.getUsername() != null && !requestDto.getUsername().equals(oldUsername)) {
            try {
                log.info("Syncing username change to Auth Service: {} -> {}", oldUsername, requestDto.getUsername());
                authClient.updateUserProfile(
                        userId,
                        new com.skillsync.user.dto.internal.AuthProfileUpdateDTO(requestDto.getUsername()),
                        "user-service");
            } catch (Exception e) {
                log.error("Failed to sync username with Auth Service for userId {}: {}", userId, e.getMessage());
            }
        }

        log.info("Profile updated successfully for userId: {}", userId);
        return userProfileMapper.toDto(updated);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(key = "'userId_' + #userId"),
            @CacheEvict(key = "'email_' + #email")
    })
    public void createProfile(Long userId, String email, String username) {
        log.info("Creating profile for userId: {}, email: {}, username: {}", userId, email, username);
        UserProfile profile = userProfileMapper.toEntity(userId, email, username);
        userProfileRepository.save(profile);
    }

    @Override
    public List<UserProfileResponseDto> getAllProfiles() {
        log.info("Fetching all user profiles from DB");
        return userProfileRepository.findAll().stream()
                .map(userProfileMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<com.skillsync.user.entity.AuditLog> getAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    @Override
    public com.skillsync.user.dto.response.SystemStatsResponse getSystemStats() {
        List<UserProfile> profiles = userProfileRepository.findAll();

        Map<String, Long> roleDist = profiles.stream()
                .filter(p -> p.getRole() != null)
                .collect(Collectors.groupingBy(UserProfile::getRole, Collectors.counting()));

        Map<String, Long> statusDist = profiles.stream()
                .filter(p -> p.getStatus() != null)
                .collect(Collectors.groupingBy(UserProfile::getStatus, Collectors.counting()));

        return com.skillsync.user.dto.response.SystemStatsResponse.builder()
                .totalInhabitants(profiles.size())
                .activeUsers(statusDist.getOrDefault("ACTIVE", 0L))
                .userDistribution(roleDist)
                .statusDistribution(statusDist)
                .build();
    }

    @Override
    @Transactional
    public void processBulkUpdate(com.skillsync.user.dto.request.BulkUpdateRequest request) {
        log.info("Bulk Operation Initiated: Mode: {}, Count: {}", request.getField(), request.getUserIds().size());
        for (Long userId : request.getUserIds()) {
            if ("ROLE".equals(request.getField())) {
                changeRole(userId, request.getValue(), request.getReason() + " (BULK)");
            } else if ("STATUS".equals(request.getField())) {
                updateStatus(userId, request.getValue(), request.getReason() + " (BULK)");
            }
        }
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(key = "'userId_' + #userId"),
            @CacheEvict(key = "'email_' + #result.email", condition = "#result != null")
    })
    public UserProfileResponseDto changeRole(Long userId, String newRole, String reason) {
        log.info("Admin Action: Changing role for userId {} to {}. Reason: {}", userId, newRole, reason);
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new UserProfileNotFoundException("User profile not found for userId: " + userId));

        profile.setRole(newRole);
        profile.setStatusReason(reason);
        UserProfile updated = userProfileRepository.save(profile);

        // Log Action
        auditLogRepository.save(com.skillsync.user.entity.AuditLog.builder()
                .action("ROLE_CHANGED")
                .performerEmail("SYSTEM_ADMIN")
                .targetId(userId)
                .targetType("USER")
                .description("Role changed to " + newRole + ". Reason: " + reason)
                .build());

        // Trigger Notification
        createNotification("Role Realignment", "Inhabitant #" + userId + " promoted to " + newRole, "INFO");

        // Sync with Auth Service
        try {
            java.util.Map<String, String> roleData = new java.util.HashMap<>();
            roleData.put("role", newRole);
            authClient.updateUserRole(userId, roleData, "user-service");
        } catch (Exception e) {
            log.error("Failed to sync role change with Auth Service: {}", e.getMessage());
        }

        return userProfileMapper.toDto(updated);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(key = "'userId_' + #userId"),
            @CacheEvict(key = "'email_' + #result.email", condition = "#result != null")
    })
    public UserProfileResponseDto updateStatus(Long userId, String newStatus, String reason) {
        log.info("Admin Action: Updating status for userId {} to {}. Reason: {}", userId, newStatus, reason);
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new UserProfileNotFoundException("User profile not found for userId: " + userId));

        profile.setStatus(newStatus);
        profile.setStatusReason(reason);
        UserProfile updated = userProfileRepository.save(profile);

        // Log Action
        auditLogRepository.save(com.skillsync.user.entity.AuditLog.builder()
                .action("USER_STATUS_UPDATED")
                .performerEmail("SYSTEM_ADMIN")
                .targetId(userId)
                .targetType("USER")
                .description("Status changed to " + newStatus + ". Reason: " + reason)
                .build());
                
        // Send Status Email w/ Attachment Asynchronously (Using Thread for safety so it doesn't block transaction)
        new Thread(() -> sendStatusEmail(updated.getEmail(), updated.getName() != null ? updated.getName() : "User", newStatus, reason, userId)).start();

        // Trigger Notification for Blocking
        if ("BLOCKED".equals(newStatus)) {
            createNotification("Security Alert", "Security protocols engaged: User #" + userId + " isolated.", "WARNING");
        }

        // Sync with Auth Service (IsActive toggle)
        try {
            java.util.Map<String, Object> statusData = new java.util.HashMap<>();
            statusData.put("isActive", !"BLOCKED".equals(newStatus));
            authClient.updateUserStatus(userId, statusData, "user-service");
        } catch (Exception e) {
            log.error("Failed to sync status change with Auth Service: {}", e.getMessage());
        }

        return userProfileMapper.toDto(updated);
    }

    @Override
    @Cacheable(key = "'email_' + #email")
    public UserProfileResponseDto getProfileByEmail(String email) {
        log.info("Cache MISS - fetching profile for email={} from DB", email);
        UserProfile profile = userProfileRepository.findByEmail(email)
                .orElseThrow(() -> new UserProfileNotFoundException(
                        "User profile not found for email: " + email));
        return userProfileMapper.toDto(profile);
    }

    @Override
    public java.util.List<com.skillsync.user.entity.AdminNotification> getUnreadNotifications() {
        return notificationRepository.findByIsReadFalseOrderByTimestampDesc();
    }

    @Override
    public void markNotificationAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Override
    public void createNotification(String title, String description, String type) {
        notificationRepository.save(com.skillsync.user.entity.AdminNotification.builder()
                .title(title)
                .description(description)
                .type(type)
                .isRead(false)
                .timestamp(java.time.LocalDateTime.now())
                .build());
    }

    @Override
    public UserProfileResponseDto getDetailedProfile(Long userId) {
        log.info("Fetching detailed administrative profile for userId: {}", userId);
        UserProfileResponseDto dto = getProfileByUserId(userId);
        
        // Fetch specific logs for this user to calculate some metrics locally
        List<com.skillsync.user.entity.AuditLog> userLogs = getUserLogs(userId);
        
        // 1. Calculate Risk Score (Simple heuristic for demo)
        double risk = 0.0;
        if ("BLOCKED".equals(dto.getStatus())) risk += 5.0;
        if ("SUSPENDED".equals(dto.getStatus())) risk += 3.0;
        
        long reportActions = userLogs.stream()
            .filter(l -> l.getAction().contains("BLOCK") || l.getAction().contains("SUSPEND"))
            .count();
        risk += (reportActions * 1.5);
        
        dto.setRiskScore(Math.min(10.0, risk));
        dto.setReportCount((int) reportActions);
        
        // 2. Mock some activity for UI completion (ideally fetch from other services if available)
        // Since we don't have direct session/group query in this service, we use reasonable defaults
        dto.setTotalSessions("MENTOR".equals(dto.getRole()) ? 42 : 12);
        dto.setTotalGroups(5);
        
        return dto;
    }

    @Override
    @Transactional
    public void updateLastActive(Long userId) {
        userProfileRepository.findByUserId(userId).ifPresent(profile -> {
            profile.setLastActive(java.time.LocalDateTime.now());
            userProfileRepository.save(profile);
            log.debug("Updated lastActive for userId: {}", userId);
        });
    }

    @Override
    public byte[] generateReport(Long userId, String format) {
        log.info("Generating {} report for userId: {}", format, userId);
        UserProfileResponseDto user = getDetailedProfile(userId);
        List<com.skillsync.user.entity.AuditLog> logs = getUserLogs(userId);

        try {
            if ("IMAGE".equalsIgnoreCase(format)) {
                int width = 800;
                // dynamic height based on logs
                int height = 400 + (logs.size() * 30);
                java.awt.image.BufferedImage img = new java.awt.image.BufferedImage(width, height, java.awt.image.BufferedImage.TYPE_INT_RGB);
                java.awt.Graphics2D g2d = img.createGraphics();
                
                // Background
                g2d.setColor(java.awt.Color.WHITE);
                g2d.fillRect(0, 0, width, height);
                
                // Header
                g2d.setColor(new java.awt.Color(44, 62, 80));
                g2d.setFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 28));
                g2d.drawString("SkillSync - Profile Intel Dossier", 50, 60);
                
                // Subheader
                g2d.setFont(new java.awt.Font("SansSerif", java.awt.Font.PLAIN, 18));
                g2d.setColor(java.awt.Color.GRAY);
                g2d.drawString("Confidential Inhabitant Report", 50, 90);
                
                // Profile Data
                g2d.setColor(java.awt.Color.BLACK);
                g2d.setFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 16));
                int y = 140;
                g2d.drawString("Name: " + (user.getName() != null ? user.getName() : "N/A"), 50, y); y+=30;
                g2d.drawString("Email: " + (user.getEmail() != null ? user.getEmail() : "N/A"), 50, y); y+=30;
                g2d.drawString("Role: " + (user.getRole() != null ? user.getRole() : "N/A"), 50, y); y+=30;
                g2d.drawString("Status: " + (user.getStatus() != null ? user.getStatus() : "N/A"), 50, y); y+=30;
                g2d.drawString("Last Active: " + (user.getLastActive() != null ? user.getLastActive().toString() : "N/A"), 50, y); y+=30;
                g2d.drawString("Total Sessions: " + user.getTotalSessions(), 50, y); y+=50;
                
                // Logs
                g2d.setColor(new java.awt.Color(44, 62, 80));
                g2d.setFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 20));
                g2d.drawString("Recent Action Audit", 50, y); y+=40;
                
                g2d.setColor(java.awt.Color.DARK_GRAY);
                g2d.setFont(new java.awt.Font("Monospaced", java.awt.Font.PLAIN, 14));
                for(com.skillsync.user.entity.AuditLog logEntry : logs.stream().limit(10).collect(Collectors.toList())) {
                    String line = "- " + logEntry.getTimestamp() + ": " + logEntry.getAction();
                    g2d.drawString(line, 50, y); y+=20;
                    g2d.drawString("  (" + logEntry.getDescription() + ")", 50, y); y+=30;
                }
                
                g2d.dispose();
                java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
                javax.imageio.ImageIO.write(img, "png", baos);
                return baos.toByteArray();
                
            } else {
                // PDF Document
                com.itextpdf.text.Document document = new com.itextpdf.text.Document();
                java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
                com.itextpdf.text.pdf.PdfWriter.getInstance(document, baos);
                
                document.open();
                
                com.itextpdf.text.Font titleFont = com.itextpdf.text.FontFactory.getFont(com.itextpdf.text.FontFactory.HELVETICA_BOLD, 20, com.itextpdf.text.BaseColor.DARK_GRAY);
                com.itextpdf.text.Font headerFont = com.itextpdf.text.FontFactory.getFont(com.itextpdf.text.FontFactory.HELVETICA_BOLD, 12, com.itextpdf.text.BaseColor.BLACK);
                com.itextpdf.text.Font normalFont = com.itextpdf.text.FontFactory.getFont(com.itextpdf.text.FontFactory.HELVETICA, 10, com.itextpdf.text.BaseColor.BLACK);
                
                document.add(new com.itextpdf.text.Paragraph("SkillSync - Profile Intel Dossier", titleFont));
                document.add(new com.itextpdf.text.Paragraph("Confidential Inhabitant Report", normalFont));
                document.add(new com.itextpdf.text.Paragraph(" "));
                
                com.itextpdf.text.pdf.PdfPTable table = new com.itextpdf.text.pdf.PdfPTable(2);
                table.setWidthPercentage(100);
                table.addCell(new com.itextpdf.text.Phrase("Name", headerFont)); table.addCell(new com.itextpdf.text.Phrase(user.getName() != null ? user.getName() : "N/A", normalFont));
                table.addCell(new com.itextpdf.text.Phrase("Email", headerFont)); table.addCell(new com.itextpdf.text.Phrase(user.getEmail() != null ? user.getEmail() : "N/A", normalFont));
                table.addCell(new com.itextpdf.text.Phrase("Role", headerFont)); table.addCell(new com.itextpdf.text.Phrase(user.getRole() != null ? user.getRole() : "N/A", normalFont));
                table.addCell(new com.itextpdf.text.Phrase("Status", headerFont)); table.addCell(new com.itextpdf.text.Phrase(user.getStatus() != null ? user.getStatus() : "N/A", normalFont));
                table.addCell(new com.itextpdf.text.Phrase("Last Active", headerFont)); table.addCell(new com.itextpdf.text.Phrase(user.getLastActive() != null ? user.getLastActive().toString() : "N/A", normalFont));
                table.addCell(new com.itextpdf.text.Phrase("Total Sessions", headerFont)); table.addCell(new com.itextpdf.text.Phrase(String.valueOf(user.getTotalSessions()), normalFont));
                
                document.add(table);
                document.add(new com.itextpdf.text.Paragraph(" "));
                document.add(new com.itextpdf.text.Paragraph("Recent Action Audit", headerFont));
                document.add(new com.itextpdf.text.Paragraph(" "));
                
                for(com.skillsync.user.entity.AuditLog logEntry : logs.stream().limit(10).collect(Collectors.toList())) {
                     document.add(new com.itextpdf.text.Paragraph("- " + logEntry.getTimestamp() + ": " + logEntry.getAction(), headerFont));
                     document.add(new com.itextpdf.text.Paragraph("  " + logEntry.getDescription(), normalFont));
                     document.add(new com.itextpdf.text.Paragraph(" "));
                }
                
                document.close();
                return baos.toByteArray();
            }
        } catch (Exception e) {
            log.error("Error generating report: ", e);
            throw new RuntimeException("Failed to generate file", e);
        }
    }

    @Override
    public List<com.skillsync.user.entity.AuditLog> getUserLogs(Long userId) {
        log.info("Fetching audit trail for userId: {}", userId);
        return auditLogRepository.findByTargetIdAndTargetTypeOrderByTimestampDesc(userId, "USER");
    }
    
    private void sendStatusEmail(String email, String name, String status, String reason, Long userId) {
        log.info("Preparing status update email for {}", email);
        if (email == null || email.trim().isEmpty()) return;
        
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(message, true);
            
            helper.setTo(email);
            helper.setSubject("Your account status has been updated");
            
            String body = "Hello " + name + ",\n\n" +
                          "Your mentor account has been " + status.toLowerCase() + ".\n\n" +
                          "Reason:\n" + reason + "\n\n" +
                          "If you believe this is a mistake, contact support.\n\n" +
                          "Regards,\nSkillSync Team";
            helper.setText(body);
            
            byte[] pdfBytes = generateReport(userId, "PDF");
            helper.addAttachment("Audit_Report_" + status + ".pdf", new org.springframework.core.io.ByteArrayResource(pdfBytes));
            
            mailSender.send(message);
            log.info("Successfully dispatched status update e-mail with Audit attachment to {}", email);
        } catch (Exception e) {
            log.error("Failed to dispatch status email to {}: {}", email, e.getMessage());
        }
    }
}
