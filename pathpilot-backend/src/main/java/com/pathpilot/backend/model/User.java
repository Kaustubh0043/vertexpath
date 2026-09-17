package com.pathpilot.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "streak_count", nullable = false)
    @Builder.Default
    private int streakCount = 0;

    @Column(name = "last_active_date")
    private LocalDate lastActiveDate;

    @Column(name = "enabled", nullable = false)
    @Builder.Default
    private boolean enabled = false;

    @Column(name = "verification_code")
    private String verificationCode;

    @Column(name = "verification_code_expires_at")
    private LocalDateTime verificationCodeExpiresAt;

    @Column(name = "onboarding_completed")
    @Builder.Default
    private Boolean onboardingCompleted = false;

    public boolean isOnboardingCompleted() {
        return onboardingCompleted != null && onboardingCompleted;
    }

    @Column(name = "career_goal")
    private String careerGoal;

    @Column(name = "custom_career_goal")
    private String customCareerGoal;

    @Column(name = "experience_level")
    private String experienceLevel;

    @Column(name = "technologies", length = 1000)
    private String technologies;

    @Column(name = "career_objective")
    private String careerObjective;

    @Column(name = "skill_gaps", length = 1000)
    private String skillGaps;

    @Column(name = "weekly_commitment")
    private String weeklyCommitment;

    @Column(name = "optional_learning_style")
    private String optionalLearningStyle;

    @Column(name = "optional_job_preference")
    private String optionalJobPreference;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "onboarding_completed_at")
    private LocalDateTime onboardingCompletedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
