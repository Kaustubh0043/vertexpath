package com.pathpilot.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String refreshToken;
    private UUID userId;
    private String email;
    private String fullName;
    private String message;
    private boolean onboardingCompleted;
    private String avatarUrl;
    private String careerGoal;
}
