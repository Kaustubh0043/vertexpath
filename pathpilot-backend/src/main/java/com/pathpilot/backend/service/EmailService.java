package com.pathpilot.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public String getFromEmail() {
        return fromEmail;
    }

    public void sendTestEmail(String toEmail) {
        log.info("Attempting synchronous test email to {} from {}", toEmail, fromEmail);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("VertexPath.AI - Test Email Diagnostic");
        message.setText("Hello! If you are reading this, your VertexPath Gmail SMTP integration is working perfectly.");
        mailSender.send(message);
        log.info("Test email sent successfully to {}", toEmail);
    }

    public void sendVerificationEmail(String toEmail, String code) {
        log.info("--------------------------------------------------");
        log.info("VERIFICATION CODE FOR {}: {}", toEmail, code);
        log.info("--------------------------------------------------");
        
        if (fromEmail == null || fromEmail.isBlank()) {
            log.warn("SMTP email username is not configured. Skipping sending actual email.");
            return;
        }

        // Send email in a background thread to prevent blocking signup API response
        new Thread(() -> {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(toEmail);
                message.setSubject("VertexPath.AI - Verify Your Account");
                message.setText("Welcome to VertexPath.AI!\n\n" +
                        "Your verification code is: " + code + "\n\n" +
                        "This code will expire in 15 minutes.\n\n" +
                        "Best regards,\n" +
                        "The VertexPath.AI Team");
                mailSender.send(message);
                log.info("Verification email sent successfully to {}", toEmail);
            } catch (Exception e) {
                log.error("Failed to send verification email to {}: {}", toEmail, e.getMessage(), e);
            }
        }).start();
    }

    public void sendContactEmail(String fromName, String fromUserEmail, String messageText) {
        log.info("--------------------------------------------------");
        log.info("CONTACT FORM SUBMISSION FROM {} ({}): {}", fromName, fromUserEmail, messageText);
        log.info("--------------------------------------------------");
        
        if (fromEmail == null || fromEmail.isBlank()) {
            log.warn("SMTP email username is not configured. Skipping sending actual email.");
            return;
        }

        new Thread(() -> {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo("kaustubhjadhav0043@gmail.com");
                message.setReplyTo(fromUserEmail);
                message.setSubject("VertexPath.AI - New Contact Message from " + fromName);
                message.setText("You received a new message from the VertexPath.AI contact form:\n\n" +
                        "Name: " + fromName + "\n" +
                        "Email: " + fromUserEmail + "\n\n" +
                        "Message:\n" + messageText + "\n\n" +
                        "Best regards,\n" +
                        "VertexPath.AI System");
                mailSender.send(message);
                log.info("Contact email forwarded successfully to developer inbox.");
            } catch (Exception e) {
                log.error("Failed to send contact email: {}", e.getMessage(), e);
            }
        }).start();
    }
}
