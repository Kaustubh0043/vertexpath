package com.pathpilot.backend.controller;

import com.pathpilot.backend.dto.AuthResponse;
import com.pathpilot.backend.dto.LoginRequest;
import com.pathpilot.backend.dto.RefreshTokenRequest;
import com.pathpilot.backend.dto.SignupRequest;
import com.pathpilot.backend.dto.VerifyRequest;
import com.pathpilot.backend.dto.ResendCodeRequest;
import com.pathpilot.backend.dto.ContactRequest;
import com.pathpilot.backend.service.AuthService;
import com.pathpilot.backend.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.client.RestClient;
import java.net.http.HttpClient;
import java.io.StringWriter;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final EmailService emailService;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = authService.signup(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<AuthResponse> verify(@Valid @RequestBody VerifyRequest request) {
        AuthResponse response = authService.verifyEmail(request.getEmail(), request.getCode());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-code")
    public ResponseEntity<Void> resendCode(@Valid @RequestBody ResendCodeRequest request) {
        authService.resendVerificationCode(request.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/contact")
    public ResponseEntity<Void> submitContact(@Valid @RequestBody ContactRequest request) {
        emailService.sendContactEmail(request.getName(), request.getEmail(), request.getMessage());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }

    @GetMapping("/test-mail")
    public ResponseEntity<Map<String, Object>> testMail(@RequestParam(defaultValue = "kaustubhjabhav0043@gmail.com") String to) {
        Map<String, Object> res = new HashMap<>();
        try {
            res.put("configuredFromEmail", emailService.getFromEmail());
            emailService.sendTestEmail(to);
            res.put("status", "SUCCESS");
            res.put("message", "Test email sent successfully to " + to);
        } catch (Exception e) {
            res.put("status", "FAILED");
            res.put("error", e.getMessage());
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            res.put("stacktrace", sw.toString());
        }
        return ResponseEntity.ok(res);
    }

    @GetMapping("/test-connection")
    public ResponseEntity<Map<String, Object>> testConnection() {
        Map<String, Object> result = new HashMap<>();
        result.put("configuredAiServiceUrl", aiServiceUrl);
        
        // 1. Test docs
        try {
            HttpClient httpClient = HttpClient.newBuilder()
                    .connectTimeout(java.time.Duration.ofSeconds(10))
                    .build();
            org.springframework.http.client.JdkClientHttpRequestFactory factory = new org.springframework.http.client.JdkClientHttpRequestFactory(httpClient);
            factory.setReadTimeout(15000);
            RestClient testClient = RestClient.builder()
                    .baseUrl(aiServiceUrl)
                    .requestFactory(factory)
                    .build();
                    
            String response = testClient.get()
                    .uri("/docs")
                    .retrieve()
                    .body(String.class);
            result.put("docsConnection", "success");
        } catch (Exception e) {
            result.put("docsConnection", "failed: " + e.getMessage());
        }

        // 2. Test compare-jd
        try {
            HttpClient httpClient = HttpClient.newBuilder()
                    .connectTimeout(java.time.Duration.ofSeconds(10))
                    .build();
            org.springframework.http.client.JdkClientHttpRequestFactory factory = new org.springframework.http.client.JdkClientHttpRequestFactory(httpClient);
            factory.setReadTimeout(30000);
            RestClient testClient = RestClient.builder()
                    .baseUrl(aiServiceUrl)
                    .requestFactory(factory)
                    .build();

            org.springframework.util.LinkedMultiValueMap<String, Object> body = new org.springframework.util.LinkedMultiValueMap<>();
            org.springframework.core.io.ByteArrayResource resource = new org.springframework.core.io.ByteArrayResource("React Developer".getBytes()) {
                @Override
                public String getFilename() {
                    return "resume.txt";
                }
            };
            body.add("file", resource);
            body.add("jd_text", "Looking for React dev");

            Map<?, ?> response = testClient.post()
                    .uri("/api/ai/compare-jd")
                    .contentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
                    
            result.put("compareJdConnection", "success");
            result.put("compareJdResponse", response);
        } catch (Exception e) {
            result.put("compareJdConnection", "failed");
            result.put("compareJdError", e.getMessage());
            StringWriter sw = new StringWriter();
            PrintWriter pw = new PrintWriter(sw);
            e.printStackTrace(pw);
            result.put("compareJdStacktrace", sw.toString());
        }
        
        return ResponseEntity.ok(result);
    }
}
