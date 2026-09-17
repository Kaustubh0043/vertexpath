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

        user.setOnboardingCompleted(dto.isOnboardingCompleted());
        user.setCareerGoal(dto.getCareerGoal());
        user.setCustomCareerGoal(dto.getCustomCareerGoal());
        user.setExperienceLevel(dto.getExperienceLevel());
        user.setTechnologies(dto.getTechnologies());
        user.setCareerObjective(dto.getCareerObjective());
        user.setSkillGaps(dto.getSkillGaps());
        user.setWeeklyCommitment(dto.getWeeklyCommitment());
        user.setOptionalLearningStyle(dto.getOptionalLearningStyle());
        user.setOptionalJobPreference(dto.getOptionalJobPreference());
        if (dto.getAvatarUrl() != null) user.setAvatarUrl(dto.getAvatarUrl());
        
        if (dto.isOnboardingCompleted() && user.getOnboardingCompletedAt() == null) {
            user.setOnboardingCompletedAt(LocalDateTime.now());
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
                .onboardingCompletedAt(savedUser.getOnboardingCompletedAt())
                .build();

        return ResponseEntity.ok(responseDto);
    }
}
