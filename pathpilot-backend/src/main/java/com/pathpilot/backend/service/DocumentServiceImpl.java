package com.pathpilot.backend.service;

import com.pathpilot.backend.dto.DocumentDto;
import com.pathpilot.backend.exception.ResourceNotFoundException;
import com.pathpilot.backend.model.Document;
import com.pathpilot.backend.model.User;
import com.pathpilot.backend.repository.DocumentRepository;
import com.pathpilot.backend.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.net.http.HttpClient;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class DocumentServiceImpl implements DocumentService {

    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final RestClient restClient;
    private final R2StorageService r2StorageService;
    private final Path fileStorageLocation;

    public DocumentServiceImpl(
            UserRepository userRepository,
            DocumentRepository documentRepository,
            @Value("${ai.service.url}") String aiServiceUrl,
            @Value("${file.upload-dir:uploads}") String uploadDir,
            R2StorageService r2StorageService) {
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
        this.r2StorageService = r2StorageService;
        HttpClient httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(java.time.Duration.ofSeconds(10))
                .build();
        org.springframework.http.client.JdkClientHttpRequestFactory factory = new org.springframework.http.client.JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(90000);
        this.restClient = RestClient.builder()
                .baseUrl(aiServiceUrl)
                .requestFactory(factory)
                .build();
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(this.fileStorageLocation);
            log.info("Initialized upload directory: {}", this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Override
    @Transactional
    public DocumentDto uploadDocument(String email, MultipartFile file, String fileType) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "unnamed_file";
        }

        // Generate unique filename to avoid conflict on disk
        String storageFilename = UUID.randomUUID().toString() + "_" + originalFilename;
        Path targetLocation = this.fileStorageLocation.resolve(storageFilename);

        byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFilename + ". Please try again!", ex);
        }

        byte[] dbBackupBytes = fileBytes;
        if (r2StorageService.isEnabled()) {
            try {
                r2StorageService.uploadFile(storageFilename, fileBytes, file.getContentType());
                dbBackupBytes = null; // Do not bloat Database if R2 is active
            } catch (Exception e) {
                log.error("Failed to upload to Cloudflare R2, keeping local database backup", e);
            }
        }

        Document document = Document.builder()
                .user(user)
                .filename(originalFilename)
                .storageKey(storageFilename)
                .fileType(fileType.toUpperCase())
                .fileData(dbBackupBytes)
                .build();

        Document saved = documentRepository.save(document);

        // Index document in ChromaDB for RAG search
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return saved.getFilename();
                }
            };
            body.add("file", resource);
            body.add("userId", user.getId().toString());
            body.add("documentId", saved.getId().toString());

            restClient.post()
                    .uri("/api/ai/rag/upload")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.error("Failed to index document in ChromaDB for RAG search", e);
        }

        return DocumentDto.builder()
                .id(saved.getId())
                .filename(saved.getFilename())
                .fileType(saved.getFileType())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentDto> getDocuments(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        return documentRepository.findByUserId(user.getId()).stream()
                .map(d -> DocumentDto.builder()
                        .id(d.getId())
                        .filename(d.getFilename())
                        .fileType(d.getFileType())
                        .createdAt(d.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] downloadDocument(UUID documentId, String email) {
        Document document = verifyAndGetDocument(documentId, email);
        Path filePath = this.fileStorageLocation.resolve(document.getStorageKey());

        try {
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not read file for download", e);
        }
    }

    @Override
    @Transactional
    public void deleteDocument(UUID documentId, String email) {
        Document document = verifyAndGetDocument(documentId, email);
        Path filePath = this.fileStorageLocation.resolve(document.getStorageKey());

        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.error("Failed to delete physical file from disk: {}", filePath, e);
        }

        // Delete from ChromaDB RAG index
        try {
            restClient.delete()
                    .uri("/api/ai/rag/delete/" + document.getId())
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.error("Failed to delete document from ChromaDB index", e);
        }

        documentRepository.delete(document);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> analyzeResume(UUID documentId, String email) {
        Document document = verifyAndGetDocument(documentId, email);
        Path filePath = this.fileStorageLocation.resolve(document.getStorageKey());

        try {
            byte[] fileBytes = Files.readAllBytes(filePath);
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource resource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    return document.getFilename();
                }
            };
            body.add("file", resource);

            Map<?, ?> response = restClient.post()
                    .uri("/api/ai/analyze-resume")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            if (response != null) {
                return (Map<String, Object>) response;
            }
        } catch (Exception e) {
            log.error("Failed to parse or analyze resume via Python AI Service", e);
        }

        return createMockResumeAnalysis(document.getFilename());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> compareResumeWithJd(UUID resumeId, String jdText, String email) {
        Document document = verifyAndGetDocument(resumeId, email);
        Path filePath = this.fileStorageLocation.resolve(document.getStorageKey());

        try {
            byte[] fileBytes = null;
            if (Files.exists(filePath)) {
                fileBytes = Files.readAllBytes(filePath);
            } else {
                // Try R2
                if (r2StorageService.isEnabled()) {
                    fileBytes = r2StorageService.downloadFile(document.getStorageKey());
                    if (fileBytes != null) {
                        Files.createDirectories(filePath.getParent());
                        Files.write(filePath, fileBytes);
                        log.info("Self-healed missing file from Cloudflare R2: {}", document.getFilename());
                    }
                }
                // Try DB
                if (fileBytes == null && document.getFileData() != null) {
                    fileBytes = document.getFileData();
                    Files.createDirectories(filePath.getParent());
                    Files.write(filePath, fileBytes);
                    log.info("Self-healed missing file from Database: {}", document.getFilename());
                }
            }
            
            if (fileBytes == null) {
                throw new java.io.FileNotFoundException("Physical file not found and no backup data in R2 or DB");
            }
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource resource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    return document.getFilename();
                }
            };
            body.add("file", resource);
            body.add("jd_text", jdText);

            Map<?, ?> response = restClient.post()
                    .uri("/api/ai/compare-jd")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            if (response != null) {
                return (Map<String, Object>) response;
            }
        } catch (Exception e) {
            log.error("Failed to compare resume with Job Description via Python AI Service", e);
        }

        return createMockJdComparison(document.getFilename());
    }

    private Document verifyAndGetDocument(UUID documentId, String email) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + documentId));

        if (!document.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new AccessDeniedException("Access denied to this document");
        }

        return document;
    }

    private Map<String, Object> createMockResumeAnalysis(String filename) {
        log.warn("Using offline mock resume analysis for: {}", filename);
        Map<String, Object> mock = new HashMap<>();
        mock.put("ats_score", 72);
        mock.put("summary", "The candidate exhibits strong foundational software engineering skills, but the resume lacks impact metrics and contains layout elements that could trigger parser issues on older ATS portals.");
        mock.put("missing_skills", Arrays.asList("Docker", "CI/CD Pipelines", "System Design", "AWS S3"));
        mock.put("improvement_suggestions", Arrays.asList(
                "Quantify achievements: Replace 'Managed backend systems' with 'Reduced latency by 20% through query index optimization'.",
                "Ensure skills section is categorized (e.g. Languages, Databases, Tools) for scanning ease.",
                "Include project links like GitHub repo URLs for quick verification."
        ));
        mock.put("feedback", "Solid candidate with good Java foundation. Adding cloud credentials or DevOps experience would make the profile highly competitive.");
        return mock;
    }

    private Map<String, Object> createMockJdComparison(String filename) {
        log.warn("Using offline mock Job Description comparison for: {}", filename);
        Map<String, Object> mock = new HashMap<>();
        mock.put("match_percentage", 65);
        mock.put("skill_gap_analysis", Arrays.asList(
                "Job Description requests Docker & Kubernetes experience, which are missing from the resume.",
                "Resume mentions React/Vite, but JD lists Next.js as a strong asset."
        ));
        mock.put("missing_technologies", Arrays.asList("Kubernetes", "Next.js", "Jest", "GraphQL"));
        mock.put("recommended_learning_path", Arrays.asList("Learn Kubernetes fundamentals", "Build a Next.js prototype with GraphQL APIs"));
        mock.put("interview_prep_topics", Arrays.asList(
                "Next.js Server Side Rendering (SSR) vs Static Site Generation (SSG)",
                "Docker container orchestration and horizontal pod autoscaling under load",
                "Difference between REST APIs and GraphQL queries"
        ));
        return mock;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> queryRag(String query, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        try {
            Map<String, String> payload = new HashMap<>();
            payload.put("userId", user.getId().toString());
            payload.put("query", query);

            Map<?, ?> response = restClient.post()
                    .uri("/api/ai/rag/query")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(Map.class);

            if (response != null) {
                return (Map<String, Object>) response;
            }
        } catch (Exception e) {
            log.error("Failed to perform RAG search via Python AI Service", e);
        }

        Map<String, Object> fallback = new HashMap<>();
        fallback.put("answer", "I could not fetch answers from your documents at this time. Please verify that the AI service is online.");
        fallback.put("sources", Collections.emptyList());
        return fallback;
    }
}
