package com.pathpilot.backend.controller;

import com.pathpilot.backend.dto.UserProfileDto;
import com.pathpilot.backend.model.User;
import com.pathpilot.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        UserProfileDto dto = UserProfileDto.builder()
                .onboardingCompleted(user.isOnboardingCompleted())
                .careerGoal(user.getCareerGoal())
                .customCareerGoal(user.getCustomCareerGoal())
                .experienceLevel(user.getExperienceLevel())
                .technologies(user.getTechnologies())
                .careerObjective(user.getCareerObjective())
                .skillGaps(user.getSkillGaps())
                .weeklyCommitment(user.getWeeklyCommitment())
                .optionalLearningStyle(user.getOptionalLearningStyle())
                .optionalJobPreference(user.getOptionalJobPreference())
                .avatarUrl(user.getAvatarUrl())
                .onboardingCompletedAt(user.getOnboardingCompletedAt())
                .build();

        return ResponseEntity.ok(dto);
    }

        @PostMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(@RequestBody UserProfileDto dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        if (dto.getCareerGoal() != null) user.setCareerGoal(dto.getCareerGoal());
        if (dto.getCustomCareerGoal() != null) user.setCustomCareerGoal(dto.getCustomCareerGoal());
        if (dto.getExperienceLevel() != null) user.setExperienceLevel(dto.getExperienceLevel());
        if (dto.getTechnologies() != null) user.setTechnologies(dto.getTechnologies());
        if (dto.getCareerObjective() != null) user.setCareerObjective(dto.getCareerObjective());
        if (dto.getSkillGaps() != null) user.setSkillGaps(dto.getSkillGaps());
        if (dto.getWeeklyCommitment() != null) user.setWeeklyCommitment(dto.getWeeklyCommitment());
        if (dto.getOptionalLearningStyle() != null) user.setOptionalLearningStyle(dto.getOptionalLearningStyle());
        if (dto.getOptionalJobPreference() != null) user.setOptionalJobPreference(dto.getOptionalJobPreference());
        if (dto.getAvatarUrl() != null) user.setAvatarUrl(dto.getAvatarUrl());
        
        if (dto.getOnboardingCompleted() != null) {
            user.setOnboardingCompleted(dto.getOnboardingCompleted());
            if (dto.getOnboardingCompleted() && user.getOnboardingCompletedAt() == null) {
                user.setOnboardingCompletedAt(LocalDateTime.now());
            }
        }

        User savedUser = userRepository.save(user);

        UserProfileDto responseDto = UserProfileDto.builder()
                .onboardingCompleted(savedUser.isOnboardingCompleted())
                .careerGoal(savedUser.getCareerGoal())
                .customCareerGoal(savedUser.getCustomCareerGoal())
                .experienceLevel(savedUser.getExperienceLevel())
                .technologies(savedUser.getTechnologies())
                .careerObjective(savedUser.getCareerObjective())
                .skillGaps(savedUser.getSkillGaps())
                .weeklyCommitment(savedUser.getWeeklyCommitment())
                .optionalLearningStyle(savedUser.getOptionalLearningStyle())
                .optionalJobPreference(savedUser.getOptionalJobPreference())
                .avatarUrl(savedUser.getAvatarUrl())
                .onboardingCompletedAt(savedUser.getOnboardingCompletedAt())
                .build();

        return ResponseEntity.ok(responseDto);
    }
}
