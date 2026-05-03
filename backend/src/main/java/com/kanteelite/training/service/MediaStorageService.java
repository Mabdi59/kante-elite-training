package com.kanteelite.training.service;

import com.kanteelite.training.enums.MediaType;
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
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class MediaStorageService {

    private static final long MAX_FILE_SIZE_BYTES = 20L * 1024L * 1024L;
    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );
    private static final List<String> ALLOWED_IMAGE_EXTENSIONS = List.of("jpg", "jpeg", "png", "webp");
    private static final String ALLOWED_VIDEO_TYPE = "video/mp4";
    private static final String ALLOWED_VIDEO_EXTENSION = "mp4";

    private final Path rootDirectory;

    public MediaStorageService(@Value("${app.uploads.dir:uploads}") String uploadsDirectory) {
        this.rootDirectory = Paths.get(uploadsDirectory).toAbsolutePath().normalize();
    }

    public StoredMedia storePostMedia(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Choose an image or MP4 file to upload.");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("Media files must be 20 MB or smaller.");
        }

        String originalFileName = StringUtils.cleanPath(
                file.getOriginalFilename() == null ? "media-upload" : file.getOriginalFilename());
        String extension = normalizeExtension(originalFileName);
        String contentType = normalizeContentType(file.getContentType());
        MediaType mediaType = resolveMediaType(contentType, extension);
        String safeFileName = originalFileName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String storedFileName = UUID.randomUUID() + "-" + safeFileName;

        LocalDate today = LocalDate.now();
        Path mediaDirectory = rootDirectory
                .resolve("media-posts")
                .resolve(String.valueOf(today.getYear()))
                .resolve(String.format("%02d", today.getMonthValue()));
        Files.createDirectories(mediaDirectory);

        Path destination = mediaDirectory.resolve(storedFileName);
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
        }

        String relativePath = rootDirectory.relativize(destination).toString().replace('\\', '/');
        return StoredMedia.builder()
                .mediaType(mediaType)
                .contentType(contentType)
                .relativePath(relativePath)
                .publicUrl(buildPublicUrl(relativePath))
                .build();
    }

    public void deleteStoredMedia(String publicUrl) throws IOException {
        if (!StringUtils.hasText(publicUrl)) {
            return;
        }
        if (!publicUrl.startsWith("/api/uploads/")) {
            return;
        }

        String relativePath = publicUrl.replaceFirst("^/api/uploads/", "");
        if (!StringUtils.hasText(relativePath)) {
            return;
        }

        Path target = rootDirectory.resolve(relativePath).normalize();
        if (!target.startsWith(rootDirectory)) {
            throw new IllegalArgumentException("Invalid media path.");
        }

        Files.deleteIfExists(target);
    }

    public String buildPublicUrl(String relativePath) {
        return "/api/uploads/" + relativePath.replace('\\', '/');
    }

    private MediaType resolveMediaType(String contentType, String extension) {
        boolean imageExtensionAllowed = ALLOWED_IMAGE_EXTENSIONS.contains(extension);
        boolean imageTypeAllowed = ALLOWED_IMAGE_TYPES.contains(contentType);
        boolean videoExtensionAllowed = ALLOWED_VIDEO_EXTENSION.equals(extension);
        boolean videoTypeAllowed = ALLOWED_VIDEO_TYPE.equals(contentType);

        if (imageExtensionAllowed && (imageTypeAllowed || !StringUtils.hasText(contentType))) {
            return MediaType.IMAGE;
        }
        if (videoExtensionAllowed && (videoTypeAllowed || !StringUtils.hasText(contentType))) {
            return MediaType.VIDEO;
        }
        throw new IllegalArgumentException("Only JPG, PNG, WEBP, and MP4 uploads are supported.");
    }

    private String normalizeContentType(String value) {
        if (!StringUtils.hasText(value)) {
            return "application/octet-stream";
        }
        return value.toLowerCase(Locale.ROOT);
    }

    private String normalizeExtension(String fileName) {
        String extension = StringUtils.getFilenameExtension(fileName);
        return extension == null ? "" : extension.toLowerCase(Locale.ROOT);
    }

    @Getter
    @Builder
    public static class StoredMedia {
        private final String relativePath;
        private final String publicUrl;
        private final String contentType;
        private final MediaType mediaType;
    }
}
