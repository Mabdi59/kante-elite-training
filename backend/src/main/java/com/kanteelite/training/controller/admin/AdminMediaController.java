package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.request.MediaPostUpdateRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.MediaPostResponse;
import com.kanteelite.training.service.AuditLogService;
import com.kanteelite.training.service.MediaPostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/media")
@RequiredArgsConstructor
public class AdminMediaController {

    private final MediaPostService mediaPostService;
    private final AuditLogService auditLogService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<MediaPostResponse>> createMediaPost(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption,
            @AuthenticationPrincipal UserDetails principal) {
        MediaPostResponse created = mediaPostService.createPost(file, caption);
        String actor = principal != null ? principal.getUsername() : "admin";
        auditLogService.log(actor, "CREATE", "MediaPost", created.getId(), "Uploaded media post.");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Media post created.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MediaPostResponse>> updateMediaPost(
            @PathVariable Long id,
            @Valid @RequestBody MediaPostUpdateRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        MediaPostResponse updated = mediaPostService.updatePost(id, request);
        String actor = principal != null ? principal.getUsername() : "admin";
        auditLogService.log(actor, "UPDATE", "MediaPost", id, "Updated media post placement.");
        return ResponseEntity.ok(ApiResponse.success("Media post updated.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMediaPost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        mediaPostService.deletePost(id);
        String actor = principal != null ? principal.getUsername() : "admin";
        auditLogService.log(actor, "DELETE", "MediaPost", id, "Deleted media post.");
        return ResponseEntity.ok(ApiResponse.success("Media post deleted.", null));
    }
}
