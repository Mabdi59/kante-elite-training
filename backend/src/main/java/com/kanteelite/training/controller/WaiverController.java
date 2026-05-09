package com.kanteelite.training.controller;

import jakarta.validation.Valid;
import com.kanteelite.training.dto.request.SignWaiverRequest;
import com.kanteelite.training.dto.request.WaiverTemplateRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.PlayerDocumentResponse;
import com.kanteelite.training.dto.response.SignedWaiverResponse;
import com.kanteelite.training.dto.response.WaiverTemplateResponse;
import com.kanteelite.training.service.WaiverService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class WaiverController {

    private final WaiverService waiverService;

    @GetMapping("/api/waivers/templates")
    public ResponseEntity<ApiResponse<List<WaiverTemplateResponse>>> getActiveTemplates() {
        return ResponseEntity.ok(ApiResponse.success(waiverService.getActiveTemplates()));
    }

    @GetMapping("/api/admin/waivers/templates")
    public ResponseEntity<ApiResponse<List<WaiverTemplateResponse>>> getAllTemplates() {
        return ResponseEntity.ok(ApiResponse.success(waiverService.getAllTemplates()));
    }

    @PostMapping("/api/admin/waivers/templates")
    public ResponseEntity<ApiResponse<WaiverTemplateResponse>> createTemplate(
            @Valid @RequestBody WaiverTemplateRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(waiverService.createTemplate(request, user.getUsername())));
    }

    @PutMapping("/api/admin/waivers/templates/{id}")
    public ResponseEntity<ApiResponse<WaiverTemplateResponse>> updateTemplate(
            @PathVariable Long id,
            @Valid @RequestBody WaiverTemplateRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(waiverService.updateTemplate(id, request, user.getUsername())));
    }

    @DeleteMapping("/api/admin/waivers/templates/{id}")
    public ResponseEntity<Void> deleteTemplate(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        waiverService.deleteTemplate(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/waivers/sign")
    public ResponseEntity<ApiResponse<SignedWaiverResponse>> signWaiver(
            @Valid @RequestBody SignWaiverRequest request,
            @AuthenticationPrincipal UserDetails user,
            HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        return ResponseEntity.ok(ApiResponse.success(waiverService.signWaiver(request, user.getUsername(), user.getUsername(), ip)));
    }

    @GetMapping("/api/waivers/my-signed")
    public ResponseEntity<ApiResponse<List<SignedWaiverResponse>>> getMySigned(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(waiverService.getSignedWaiversForUser(user.getUsername())));
    }

    @GetMapping("/api/waivers/check/{templateId}")
    public ResponseEntity<ApiResponse<Boolean>> checkSigned(
            @PathVariable Long templateId,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(waiverService.hasSignedWaiver(templateId, user.getUsername())));
    }

    @GetMapping("/api/documents/my")
    public ResponseEntity<ApiResponse<List<PlayerDocumentResponse>>> getMyDocuments(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(waiverService.getDocumentsForPlayer(user.getUsername())));
    }

    @GetMapping("/api/admin/documents/player/{email}")
    public ResponseEntity<ApiResponse<List<PlayerDocumentResponse>>> getPlayerDocuments(@PathVariable String email) {
        return ResponseEntity.ok(ApiResponse.success(waiverService.getDocumentsForPlayer(email)));
    }

    @DeleteMapping("/api/admin/documents/{id}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        waiverService.deleteDocument(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }
}
