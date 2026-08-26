package com.pathpilot.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import jakarta.annotation.PostConstruct;
import java.net.URI;

@Service
@Slf4j
public class R2StorageService {

    @Value("${r2.endpoint:}")
    private String endpoint;

    @Value("${r2.access-key:}")
    private String accessKey;

    @Value("${r2.secret-key:}")
    private String secretKey;

    @Value("${r2.bucket-name:}")
    private String bucketName;

    private S3Client s3Client;
    private boolean enabled = false;

    @PostConstruct
    public void init() {
        if (endpoint != null && !endpoint.isBlank() &&
            accessKey != null && !accessKey.isBlank() &&
            secretKey != null && !secretKey.isBlank() &&
            bucketName != null && !bucketName.isBlank()) {
            try {
                this.s3Client = S3Client.builder()
                        .endpointOverride(URI.create(endpoint))
                        .credentialsProvider(StaticCredentialsProvider.create(
                                AwsBasicCredentials.create(accessKey, secretKey)
                        ))
                        .region(Region.US_EAST_1)
                        .build();
                this.enabled = true;
                log.info("Cloudflare R2 storage initialized successfully for bucket: {}", bucketName);
            } catch (Exception e) {
                log.error("Failed to initialize Cloudflare R2 client", e);
            }
        } else {
            log.info("Cloudflare R2 credentials not fully provided. Falling back to Database binary storage.");
        }
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void uploadFile(String key, byte[] content, String contentType) {
        if (!enabled) return;
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(contentType)
                    .build();
            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(content));
            log.info("Successfully uploaded file to R2: {}", key);
        } catch (Exception e) {
            log.error("Failed to upload file to R2: " + key, e);
            throw new RuntimeException("R2 upload failure", e);
        }
    }

    public byte[] downloadFile(String key) {
        if (!enabled) return null;
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();
            return s3Client.getObjectAsBytes(getObjectRequest).asByteArray();
        } catch (Exception e) {
            log.error("Failed to download file from R2: " + key, e);
            return null;
        }
    }
}
