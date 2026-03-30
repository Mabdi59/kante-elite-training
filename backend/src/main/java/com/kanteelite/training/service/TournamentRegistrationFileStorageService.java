package com.kanteelite.training.service;

import lombok.Builder;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

@Service
public class TournamentRegistrationFileStorageService {

    private final Path rootDirectory;

    public TournamentRegistrationFileStorageService(
            @Value("${app.uploads.dir:uploads}") String uploadsDirectory) {
        this.rootDirectory = Paths.get(uploadsDirectory).toAbsolutePath().normalize();
    }

    public StoredFile storeRosterDocument(Long registrationId, MultipartFile file, String existingRelativePath)
            throws IOException {
        String cleanedFileName = StringUtils.cleanPath(file.getOriginalFilename() == null
                ? "roster-upload"
                : file.getOriginalFilename());
        String safeFileName = cleanedFileName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String storedFileName = UUID.randomUUID() + "-" + safeFileName;

        Path registrationDirectory = rootDirectory.resolve("tournament-registrations")
                .resolve(String.valueOf(registrationId));
        Files.createDirectories(registrationDirectory);

        if (StringUtils.hasText(existingRelativePath)) {
            Path existingPath = rootDirectory.resolve(existingRelativePath).normalize();
            if (Files.exists(existingPath)) {
                Files.delete(existingPath);
            }
        }

        Path destination = registrationDirectory.resolve(storedFileName);
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
        }

        return StoredFile.builder()
                .fileName(cleanedFileName)
                .relativePath(rootDirectory.relativize(destination).toString().replace('\\', '/'))
                .contentType(normalizeContentType(file.getContentType()))
                .build();
    }

    private String normalizeContentType(String contentType) {
        if (!StringUtils.hasText(contentType)) {
            return "application/octet-stream";
        }
        return contentType.toLowerCase(Locale.ROOT);
    }

    @Getter
    @Builder
    public static class StoredFile {
        private final String fileName;
        private final String relativePath;
        private final String contentType;
    }
}
