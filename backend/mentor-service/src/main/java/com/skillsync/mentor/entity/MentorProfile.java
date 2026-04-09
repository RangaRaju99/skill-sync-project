package com.skillsync.mentor.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.skillsync.mentor.audit.Auditable;

/**
 * Mentor Profile Entity
 */
@Entity
@Table(name = "mentor_profiles", uniqueConstraints = {
		@UniqueConstraint(columnNames = "userId")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorProfile extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private Long userId;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private MentorStatus status = MentorStatus.PENDING;

	@Column(nullable = false)
	private Boolean isApproved = false;

	@Column
	private Long approvedBy;

	@Column
	private LocalDateTime approvalDate;

	@Column(nullable = false)
	private String specialization;

	@Column(nullable = false)
	private Integer yearsOfExperience;

	@Column(nullable = false)
	private Double hourlyRate;

	@Enumerated(EnumType.STRING)
	private AvailabilityStatus availabilityStatus = AvailabilityStatus.AVAILABLE;

	@Column
	private Double rating = 0.0;

	@Column
	private Integer totalStudents = 0;

	@Column(columnDefinition = "TEXT")
	private String bio;

	@Column
	private Double riskScore = 0.0;

	@Column
	private Integer reportCount = 0;

	@Column
	private LocalDateTime lastActive;

	@Column
	private Boolean identityVerified = false;

	@Column
	private Boolean emailVerified = false;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(nullable = false)
	private LocalDateTime updatedAt;

	@PrePersist
	protected void onCreate() {
		this.createdAt = LocalDateTime.now();
		this.updatedAt = LocalDateTime.now();
		if (this.isApproved == null) this.isApproved = false;
		if (this.rating == null) this.rating = 0.0;
		if (this.totalStudents == null) this.totalStudents = 0;
		if (this.status == null) this.status = MentorStatus.PENDING;
		if (this.availabilityStatus == null) this.availabilityStatus = AvailabilityStatus.AVAILABLE;
	}

	@PreUpdate
	protected void onUpdate() {
		this.updatedAt = LocalDateTime.now();
	}
}
