package com.skillsync.user.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * User Profile Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponseDto {

    private Long id;
    private Long userId;
    private String username;
    private String email;
    private String name;
    private String bio;
    private String phoneNumber;
    private String profileImageUrl;
    private String skills;
    private Double rating;
    private Integer totalReviews;
    private Boolean isProfileComplete;
    private String status;
    private String role;
    private String statusReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Administrative Metrics (Optional/Mocked for now)
    private Integer totalSessions = 0;
    private Integer totalGroups = 0;
    private Integer reportCount = 0;
    private Integer warningsIssued = 0;
    private Double riskScore = 0.0; // 0.0 to 10.0
}
