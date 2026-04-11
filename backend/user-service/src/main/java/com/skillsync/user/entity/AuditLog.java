package com.skillsync.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String action; // MENTOR_APPROVED, USER_BLOCKED, ROLE_CHANGED, SKILL_CREATED

    @Column(nullable = false)
    private String performerEmail;

    @Column(nullable = false)
    private Long targetId;

    @Column
    private String targetType; // USER, MENTOR, SKILL

    @Column(length = 1000)
    private String description;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime timestamp;
}
