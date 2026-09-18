package com.pathpilot.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDto {
    private Boolean onboardingCompleted;
    private String careerGoal;
    private String customCareerGoal;
    private String experienceLevel;
    private String technologies;
    private String careerObjective;
    private String skillGaps;
    private String weeklyCommitment;
    private String optionalLearningStyle;
    private String optionalJobPreference;
    private String avatarUrl;
    private LocalDateTime onboardingCompletedAt;
}
