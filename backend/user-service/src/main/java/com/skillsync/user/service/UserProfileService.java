package com.skillsync.user.service;

import com.skillsync.user.dto.request.UpdateProfileRequestDto;
import com.skillsync.user.dto.response.UserProfileResponseDto;
import java.util.Map;

/**
 * User Profile Service Interface
 */
public interface UserProfileService {

    /**
     * Get profile by userId
     */
    UserProfileResponseDto getProfileByUserId(Long userId);

    /**
     * Update user profile
     */
    UserProfileResponseDto updateProfile(Long userId, UpdateProfileRequestDto requestDto);

    /**
     * Get profile by email
     */
    UserProfileResponseDto getProfileByEmail(String email);

    /**
     * Create user profile from internal endpoint (Auth Service)
     */
    void createProfile(Long userId, String email, String username);

    /**
     * Get all registered users (Admin only)
     */
    java.util.List<UserProfileResponseDto> getAllProfiles();

    /**
     * Change user role (Admin only)
     */
    UserProfileResponseDto changeRole(Long userId, String newRole, String reason);

    /**
     * Block/Suspend user (Admin only)
     */
    UserProfileResponseDto updateStatus(Long userId, String newStatus, String reason);

    /**
     * Get all administrative audit logs
     */
    java.util.List<com.skillsync.user.entity.AuditLog> getAuditLogs();

    /**
     * Detailed system engagement stats (Admin only)
     */
    com.skillsync.user.dto.response.SystemStatsResponse getSystemStats();

    /**
     * Batch process a multitude of user changes (Admin only)
     */
    void processBulkUpdate(com.skillsync.user.dto.request.BulkUpdateRequest request);
    
    // Notification Methods
    java.util.List<com.skillsync.user.entity.AdminNotification> getUnreadNotifications();
    void markNotificationAsRead(Long id);
    void createNotification(String title, String description, String type);
}
