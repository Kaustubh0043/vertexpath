package com.pathpilot.backend.service;

import com.pathpilot.backend.dto.AuthResponse;
import com.pathpilot.backend.dto.LoginRequest;
import com.pathpilot.backend.dto.SignupRequest;
import com.pathpilot.backend.exception.ResourceNotFoundException;
import com.pathpilot.backend.exception.UserAlreadyExistsException;
import com.pathpilot.backend.model.User;
import com.pathpilot.backend.repository.UserRepository;
import com.pathpilot.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    @Override
    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email address is already in use: " + request.getEmail());
        }

        // Generate 6-digit code
        String code = String.format("%06d", new Random().nextInt(1000000));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(15);

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .streakCount(1) // Start streak on signup
                .enabled(false) // Strict verification enabled
                .verificationCode(code)
                .verificationCodeExpiresAt(expiresAt)
                .build();

        User savedUser = userRepository.save(user);

        // Send verification email in the background (as logs or backup)
        emailService.sendVerificationEmail(savedUser.getEmail(), code);

        return AuthResponse.builder()
                .token(null)
                .refreshToken(null)
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .message("verification_required")
                .onboardingCompleted(savedUser.isOnboardingCompleted())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (!user.isEnabled()) {
            throw new BadCredentialsException("ACCOUNT_NOT_VERIFIED");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = tokenProvider.generateToken(user.getEmail(), user.getId());
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail(), user.getId());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .onboardingCompleted(user.isOnboardingCompleted())
                .avatarUrl(user.getAvatarUrl())
                .careerGoal(user.getCareerGoal())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }

        String email = tokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        String token = tokenProvider.generateToken(user.getEmail(), user.getId());
        String newRefreshToken = tokenProvider.generateRefreshToken(user.getEmail(), user.getId());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(newRefreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .onboardingCompleted(user.isOnboardingCompleted())
                .avatarUrl(user.getAvatarUrl())
                .careerGoal(user.getCareerGoal())
                .build();
    }

    @Override
    @Transactional
    public AuthResponse verifyEmail(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (user.isEnabled()) {
            throw new BadCredentialsException("Account is already verified");
        }

        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(code)) {
            throw new BadCredentialsException("Invalid verification code");
        }

        if (user.getVerificationCodeExpiresAt() == null || user.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadCredentialsException("Verification code has expired");
        }

        user.setEnabled(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiresAt(null);
        User savedUser = userRepository.save(user);

        String token = tokenProvider.generateToken(savedUser.getEmail(), savedUser.getId());
        String refreshToken = tokenProvider.generateRefreshToken(savedUser.getEmail(), savedUser.getId());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .message("verified")
                .onboardingCompleted(savedUser.isOnboardingCompleted())
                .build();
    }

    @Override
    @Transactional
    public void resendVerificationCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (user.isEnabled()) {
            throw new BadCredentialsException("Account is already verified");
        }

        String code = String.format("%06d", new Random().nextInt(1000000));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(15);

        user.setVerificationCode(code);
        user.setVerificationCodeExpiresAt(expiresAt);
        userRepository.save(user);

        emailService.sendVerificationEmail(user.getEmail(), code);
    }
}


