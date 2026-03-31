package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.request.WebsiteContentRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.WebsiteContentResponse;
import com.kanteelite.training.service.AuditLogService;
import com.kanteelite.training.service.WebsiteContentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/content")
@RequiredArgsConstructor
public class AdminWebsiteContentController {

    private final WebsiteContentService websiteContentService;
    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<WebsiteContentResponse>> getAdminContent() {
        return ResponseEntity.ok(ApiResponse.success(websiteContentService.getAdminContent()));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<WebsiteContentResponse>> updateContent(
            @Valid @RequestBody WebsiteContentRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        WebsiteContentResponse updated = websiteContentService.updateContent(request);
        String actor = principal != null ? principal.getUsername() : "admin";
        auditLogService.log(actor, "UPDATE", "WebsiteContent", updated.getId(), "Updated website content.");
        return ResponseEntity.ok(ApiResponse.success("Website content updated.", updated));
    }
}
