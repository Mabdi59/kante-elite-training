package com.kanteelite.training.controller;

import com.kanteelite.training.dto.response.PlayerDocumentResponse;
import com.kanteelite.training.enums.DocumentType;
import com.kanteelite.training.service.WaiverService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Slf4j
public class DocumentUploadController {

    private static final long MAX_BYTES = 10L * 1024 * 1024; // 10 MB
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    private static final Set<String> PRIVILEGED_ROLES = Set.of(
            "ROLE_ADMIN", "ROLE_STAFF"
    );

    private final WaiverService waiverService;

    @Value("${app.uploads.dir:uploads}")
    private String uploadsDir;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "docType", defaultValue = "OTHER") DocumentType docType,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "playerEmail", required = false) String playerEmail,
            @AuthenticationPrincipal UserDetails user) throws IOException {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided."));
        }
        if (file.getSize() > MAX_BYTES) {
            return ResponseEntity.badRequest().body(Map.of("error", "File must be 10 MB or smaller."));
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                    .body(Map.of("error", "Unsupported file type. Allowed: PDF, JPG, PNG, DOC, DOCX."));
        }

        // Ownership check: only ADMIN/STAFF may upload for a different player
        boolean isPrivileged = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(PRIVILEGED_ROLES::contains);

        String targetEmail;
        if (playerEmail != null && !playerEmail.isBlank()) {
            if (!isPrivileged && !playerEmail.equalsIgnoreCase(user.getUsername())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You may only upload documents for yourself."));
            }
            targetEmail = playerEmail.trim().toLowerCase();
        } else {
            targetEmail = user.getUsername();
        }

        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        // Prevent path traversal – take only the final filename component
        String safeName = Paths.get(originalName).getFileName().toString()
                .replaceAll("[^a-zA-Z0-9._-]", "_");
        String storedName = UUID.randomUUID() + "-" + safeName;

        Path docsDir = Paths.get(uploadsDir).toAbsolutePath().normalize().resolve("documents");
        Files.createDirectories(docsDir);
        Path target = docsDir.resolve(storedName);
        // Verify the resolved target is inside the intended directory (extra safety)
        if (!target.startsWith(docsDir)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid file path."));
        }
        file.transferTo(target);

        String fileUrl = "/api/uploads/documents/" + storedName;
        PlayerDocumentResponse response = waiverService.addDocument(
                targetEmail, originalName, fileUrl, docType, description, user.getUsername()
        );
        return ResponseEntity.ok(response);
    }
}
