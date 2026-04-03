package com.kanteelite.training.controller;

import com.kanteelite.training.dto.response.PlayerDocumentResponse;
import com.kanteelite.training.enums.DocumentType;
import com.kanteelite.training.service.WaiverService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Slf4j
public class DocumentUploadController {

    private final WaiverService waiverService;

    @Value("${app.uploads.dir:uploads}")
    private String uploadsDir;

    @PostMapping("/upload")
    public ResponseEntity<PlayerDocumentResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "docType", defaultValue = "OTHER") DocumentType docType,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "playerEmail", required = false) String playerEmail,
            @AuthenticationPrincipal UserDetails user) throws IOException {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (file.getSize() > 20L * 1024 * 1024) {
            return ResponseEntity.badRequest().build();
        }

        String email = (playerEmail != null && !playerEmail.isBlank()) ? playerEmail : user.getUsername();
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        // Prevent path traversal - use only the file name part
        String safeName = Paths.get(originalName).getFileName().toString()
                .replaceAll("[^a-zA-Z0-9._-]", "_");
        String storedName = UUID.randomUUID() + "-" + safeName;

        Path docsDir = Paths.get(uploadsDir).toAbsolutePath().normalize().resolve("documents");
        Files.createDirectories(docsDir);
        Path target = docsDir.resolve(storedName);
        file.transferTo(target);

        String fileUrl = "/api/uploads/documents/" + storedName;
        PlayerDocumentResponse response = waiverService.addDocument(
                email, originalName, fileUrl, docType, description, user.getUsername()
        );
        return ResponseEntity.ok(response);
    }
}
