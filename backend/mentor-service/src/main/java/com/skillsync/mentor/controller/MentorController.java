package com.skillsync.mentor.controller;

import com.skillsync.mentor.dto.ApiResponse;
import com.skillsync.mentor.dto.request.ApplyMentorRequestDto;
import com.skillsync.mentor.dto.request.UpdateAvailabilityRequestDto;
import com.skillsync.mentor.dto.response.MentorProfileResponseDto;
import com.skillsync.mentor.service.MentorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/mentor")
@Tag(name = "Mentor Management", description = "Mentor profile and application management")
public class MentorController {

    private static final Logger log = LoggerFactory.getLogger(MentorController.class);
    private final MentorService mentorService;

    public MentorController(MentorService mentorService) {
        this.mentorService = mentorService;
    }

    @PostMapping("/apply")
    @Operation(summary = "Apply as mentor", description = "Submit mentor application with skills and experience")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Mentor application submitted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request body"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<MentorProfileResponseDto>> applyAsMentor(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Parameter(hidden = true) @RequestHeader(value = "roles", required = false) String roles,
            @Valid @RequestBody ApplyMentorRequestDto request) {

        if (roles == null || !roles.contains("ROLE_LEARNER")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only learners can apply to be mentors");
        }
        log.info("POST /apply - User {}", userId);
        MentorProfileResponseDto response = mentorService.applyAsMentor(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<MentorProfileResponseDto>builder()
                        .success(true)
                        .data(response)
                        .message("Mentor application submitted successfully")
                        .statusCode(201)
                        .build());
    }

    @GetMapping("/{mentorId}")
    @Operation(summary = "Get mentor profile", description = "Retrieve mentor profile details by mentor ID")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Mentor profile retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Mentor not found")
    })
    public ResponseEntity<ApiResponse<MentorProfileResponseDto>> getMentorProfile(
            @PathVariable Long mentorId) {
        log.info("GET /{} - Get mentor profile", mentorId);
        MentorProfileResponseDto response = mentorService.getMentorProfile(mentorId);
        return ResponseEntity.ok(ApiResponse.<MentorProfileResponseDto>builder()
                .success(true)
                .data(response)
                .message("Mentor profile retrieved successfully")
                .statusCode(200)
                .build());
    }

    @GetMapping("/profile/me")
    @Operation(summary = "Get my mentor profile", description = "Retrieve current user's mentor profile")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Your mentor profile retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Mentor profile not found")
    })
    public ResponseEntity<ApiResponse<MentorProfileResponseDto>> getMyMentorProfile(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        log.info("GET /profile/me - User {}", userId);
        MentorProfileResponseDto response = mentorService.getMentorByUserId(userId);
        return ResponseEntity.ok(ApiResponse.<MentorProfileResponseDto>builder()
                .success(true)
                .data(response)
                .message("Your mentor profile retrieved successfully")
                .statusCode(200)
                .build());
    }

    @GetMapping("/approved")
    @Operation(summary = "Get all approved mentors", description = "Retrieve list of all approved mentors")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Approved mentors retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<List<MentorProfileResponseDto>>> getAllApprovedMentors() {
        log.info("GET /approved - Get all approved mentors");
        List<MentorProfileResponseDto> response = mentorService.getAllApprovedMentors();
        return ResponseEntity.ok(ApiResponse.<List<MentorProfileResponseDto>>builder()
                .success(true)
                .data(response)
                .message("Approved mentors retrieved successfully")
                .statusCode(200)
                .build());
    }

    @GetMapping("/pending")
    @Operation(summary = "Get pending mentor applications", description = "Retrieve list of pending mentor applications (Admin only)")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Pending applications retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Only admins can view pending applications"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<List<MentorProfileResponseDto>>> getPendingApplications(
            @Parameter(hidden = true) @RequestHeader(value = "roles", required = false) String role) {
        log.info("GET /pending - Get pending mentor applications");
        if (role == null || !role.contains("ROLE_ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can view pending applications");
        }
        List<MentorProfileResponseDto> response = mentorService.getPendingApplications();
        return ResponseEntity.ok(ApiResponse.<List<MentorProfileResponseDto>>builder()
                .success(true)
                .data(response)
                .message("Pending applications retrieved successfully")
                .statusCode(200)
                .build());
    }

    @GetMapping("/all")
    @Operation(summary = "Get all mentors", description = "Retrieve list of all mentors regardless of status (Admin only)")
    public ResponseEntity<ApiResponse<List<MentorProfileResponseDto>>> getAllMentors(
            @Parameter(hidden = true) @RequestHeader(value = "roles", required = false) String role) {
        log.info("GET /all - Get all mentors");
        if (role == null || !role.contains("ROLE_ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can view all mentors");
        }
        List<MentorProfileResponseDto> response = mentorService.getAllMentors();
        return ResponseEntity.ok(ApiResponse.<List<MentorProfileResponseDto>>builder()
                .success(true)
                .data(response)
                .message("All mentors retrieved successfully")
                .statusCode(200)
                .build());
    }

    @GetMapping("/pending/count")
    @Operation(summary = "Get pending mentor count", description = "Retrieve count of pending mentor applications (Admin only)")
    public ResponseEntity<ApiResponse<Long>> getPendingCount(
            @Parameter(hidden = true) @RequestHeader(value = "roles", required = false) String role) {
        log.info("GET /pending/count - Get pending count");
        if (role == null || !role.contains("ROLE_ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can view counts");
        }
        Long count = mentorService.getPendingCount();
        return ResponseEntity.ok(ApiResponse.<Long>builder()
                .success(true)
                .data(count)
                .message("Pending count retrieved successfully")
                .statusCode(200)
                .build());
    }

    @GetMapping("/search")
    @Operation(summary = "Search mentors with filters", description = "Search and filter mentors by skill, experience, rate, and rating")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Mentors found successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid search parameters")
    })
    public ResponseEntity<ApiResponse<List<MentorProfileResponseDto>>> searchMentors(
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) Integer minExperience,
            @RequestParam(required = false) Integer maxExperience,
            @RequestParam(required = false) Double maxRate,
            @RequestParam(required = false) Double minRating) {
        log.info("GET /search?skill={}&minExp={}&maxExp={}&maxRate={}&minRating={}", skill, minExperience, maxExperience, maxRate, minRating);
        List<MentorProfileResponseDto> response = mentorService.searchMentorsWithFilters(skill, minExperience, maxExperience, maxRate, minRating);
        return ResponseEntity.ok(ApiResponse.<List<MentorProfileResponseDto>>builder()
                .success(true)
                .data(response)
                .message("Mentors found successfully")
                .statusCode(200)
                .build());
    }

    @PutMapping("/{mentorId}/approve")
    public ResponseEntity<ApiResponse<MentorProfileResponseDto>> approveMentor(
            @PathVariable Long mentorId,
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long adminId,
            @Parameter(hidden = true) @RequestHeader(value = "roles", required = false) String role) {
        log.info("PUT /{}/approve - Admin {}", mentorId, adminId);
        if (role == null || !role.contains("ROLE_ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can approve mentors");
        }
        MentorProfileResponseDto response = mentorService.approveMentor(mentorId, adminId);
        return ResponseEntity.ok(ApiResponse.<MentorProfileResponseDto>builder()
                .success(true)
                .data(response)
                .message("Mentor approved successfully")
                .statusCode(200)
                .build());
    }

    @PutMapping("/{mentorId}/reject")
    public ResponseEntity<ApiResponse<MentorProfileResponseDto>> rejectMentor(
            @PathVariable Long mentorId,
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long adminId,
            @Parameter(hidden = true) @RequestHeader(value = "roles", required = false) String role) {
        log.info("PUT /{}/reject - Admin {}", mentorId, adminId);
        if (role == null || !role.contains("ROLE_ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can reject mentors");
        }
        MentorProfileResponseDto response = mentorService.rejectMentor(mentorId, adminId);
        return ResponseEntity.ok(ApiResponse.<MentorProfileResponseDto>builder()
                .success(true)
                .data(response)
                .message("Mentor rejected successfully")
                .statusCode(200)
                .build());
    }

    @PutMapping("/availability")
    public ResponseEntity<ApiResponse<MentorProfileResponseDto>> updateAvailability(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Parameter(hidden = true) @RequestHeader(value = "roles", required = false) String roles,
            @Valid @RequestBody UpdateAvailabilityRequestDto request) {

        if (roles == null || !roles.contains("ROLE_MENTOR")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only mentors can update their availability");
        }
        log.info("PUT /availability - User {}", userId);
        MentorProfileResponseDto response = mentorService.updateAvailability(userId, request);
        return ResponseEntity.ok(ApiResponse.<MentorProfileResponseDto>builder()
                .success(true)
                .data(response)
                .message("Availability updated successfully")
                .statusCode(200)
                .build());
    }

    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<List<MentorProfileResponseDto>>> getMentorsForAdmin(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) Integer experience,
            @Parameter(hidden = true) @RequestHeader(value = "roles", required = false) String role) {
        
        if (role == null || !role.contains("ROLE_ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        List<MentorProfileResponseDto> response = mentorService.getMentorsForAdmin(search, status, skill, experience);
        return ResponseEntity.ok(ApiResponse.<List<MentorProfileResponseDto>>builder()
                .success(true)
                .data(response)
                .message("Mentors fetched for admin")
                .statusCode(200)
                .build());
    }

    @GetMapping("/admin/export")
    public ResponseEntity<byte[]> exportMentors(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) Integer experience,
            @Parameter(hidden = true) @RequestHeader(value = "roles", required = false) String role) {
        
        if (role == null || !role.contains("ROLE_ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        byte[] csv = mentorService.exportMentors(search, status, skill, experience);
        
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=mentors_export.csv")
                .body(csv);
    }

    @PutMapping("/{mentorId}/re-review")
    public ResponseEntity<ApiResponse<MentorProfileResponseDto>> reReviewMentor(
            @PathVariable Long mentorId,
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long adminId,
            @Parameter(hidden = true) @RequestHeader(value = "roles", required = false) String role) {
        
        if (role == null || !role.contains("ROLE_ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        MentorProfileResponseDto response = mentorService.reReviewMentor(mentorId, adminId);
        return ResponseEntity.ok(ApiResponse.<MentorProfileResponseDto>builder()
                .success(true)
                .data(response)
                .message("Mentor moved to re-review")
                .statusCode(200)
                .build());
    }

    @PostMapping("/admin/bulk")
    public ResponseEntity<ApiResponse<Void>> bulkAction(
            @RequestBody java.util.Map<String, Object> payload,
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long adminId,
            @Parameter(hidden = true) @RequestHeader(value = "roles", required = false) String role) {
        
        if (role == null || !role.contains("ROLE_ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can perform bulk actions");
        }

        List<Integer> ids = (List<Integer>) payload.get("ids");
        String action = (String) payload.get("action");

        log.info("Admin {} performing bulk {} on {} mentors", adminId, action, ids.size());

        for (Integer id : ids) {
            try {
                if ("APPROVE".equals(action)) {
                    mentorService.approveMentor(Long.valueOf(id), adminId);
                } else if ("REJECT".equals(action)) {
                    mentorService.rejectMentor(Long.valueOf(id), adminId);
                } else if ("SUSPEND".equals(action)) {
                    mentorService.suspendMentor(Long.valueOf(id), adminId);
                }
            } catch (Exception e) {
                log.error("Failed to perform bulk {} on mentorId {}: {}", action, id, e.getMessage());
            }
        }

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Bulk " + action + " operation completed")
                .statusCode(200)
                .build());
    }

    @PutMapping("/{mentorId}/suspend")
    public ResponseEntity<ApiResponse<MentorProfileResponseDto>> suspendMentor(
            @PathVariable Long mentorId,
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long adminId,
            @Parameter(hidden = true) @RequestHeader(value = "roles", required = false) String role) {
        log.info("PUT /{}/suspend - Admin {}", mentorId, adminId);
        if (role == null || !role.contains("ROLE_ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can suspend mentors");
        }
        MentorProfileResponseDto response = mentorService.suspendMentor(mentorId, adminId);
        return ResponseEntity.ok(ApiResponse.<MentorProfileResponseDto>builder()
                .success(true)
                .data(response)
                .message("Mentor suspended successfully")
                .statusCode(200)
                .build());
    }

    @PutMapping("/{mentorId}/rating")
    public ResponseEntity<ApiResponse<Void>> updateRating(
            @PathVariable Long mentorId,
            @RequestParam Double newRating) {
        log.info("PUT /{}/rating - New rating: {}", mentorId, newRating);
        mentorService.updateMentorRating(mentorId, newRating);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Rating updated successfully")
                .statusCode(200)
                .build());
    }

    /**
     * Internal endpoint for service-to-service communication
     * Used by notification-service to fetch mentor profile details
     * Bypasses gateway authorization checks
     */
    @GetMapping("/internal/{mentorId}")
    @Operation(summary = "Internal endpoint: Get mentor profile", description = "Internal service-to-service endpoint for fetching mentor profile")
    public ResponseEntity<ApiResponse<MentorProfileResponseDto>> getInternalMentorProfile(
            @PathVariable Long mentorId) {
        log.info("Internal: Fetching mentor profile for mentorId: {}", mentorId);
        MentorProfileResponseDto response = mentorService.getMentorProfile(mentorId);
        return ResponseEntity.ok(ApiResponse.<MentorProfileResponseDto>builder()
                .success(true)
                .data(response)
                .message("Mentor profile fetched successfully")
                .statusCode(200)
                .build());
    }
}
