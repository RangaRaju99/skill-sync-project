package com.skillsync.mentor.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorProfileResponseDto {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String roles;
    private String status;
    private Boolean isApproved;
    private Long approvedBy;
    private LocalDateTime approvalDate;
    private String specialization;
    private Integer yearsOfExperience;
    private String bio;
    private Double hourlyRate;
    private Double rating;
    private Integer totalStudents;
    private String availabilityStatus;
    private Double riskScore;
    private Integer reportCount;
    private LocalDateTime lastActive;
    private Boolean identityVerified;
    private Boolean emailVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
