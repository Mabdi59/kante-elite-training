package com.kanteelite.training.controller;

import com.kanteelite.training.dto.request.SignWaiverRequest;
import com.kanteelite.training.dto.request.WaiverTemplateRequest;
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
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class WaiverController {

    private final WaiverService waiverService;

    @GetMapping("/api/waivers/templates")
    public ResponseEntity<List<WaiverTemplateResponse>> getActiveTemplates() {
        return ResponseEntity.ok(waiverService.getActiveTemplates());
    }

    @GetMapping("/api/admin/waivers/templates")
    public ResponseEntity<List<WaiverTemplateResponse>> getAllTemplates() {
        return ResponseEntity.ok(waiverService.getAllTemplates());
    }

    @PostMapping("/api/admin/waivers/templates")
    public ResponseEntity<WaiverTemplateResponse> createTemplate(
            @RequestBody WaiverTemplateRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(waiverService.createTemplate(request, user.getUsername()));
    }

    @PutMapping("/api/admin/waivers/templates/{id}")
    public ResponseEntity<WaiverTemplateResponse> updateTemplate(
            @PathVariable Long id,
            @RequestBody WaiverTemplateRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(waiverService.updateTemplate(id, request, user.getUsername()));
    }

    @PostMapping("/api/waivers/sign")
    public ResponseEntity<SignedWaiverResponse> signWaiver(
            @RequestBody SignWaiverRequest request,
            @AuthenticationPrincipal UserDetails user,
            HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        return ResponseEntity.ok(waiverService.signWaiver(request, user.getUsername(), user.getUsername(), ip));
    }

    @GetMapping("/api/waivers/my-signed")
    public ResponseEntity<List<SignedWaiverResponse>> getMySigned(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(waiverService.getSignedWaiversForUser(user.getUsername()));
    }

    @GetMapping("/api/waivers/check/{templateId}")
    public ResponseEntity<Map<String, Boolean>> checkSigned(
            @PathVariable Long templateId,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(Map.of("signed", waiverService.hasSignedWaiver(templateId, user.getUsername())));
    }

    @GetMapping("/api/documents/my")
    public ResponseEntity<List<PlayerDocumentResponse>> getMyDocuments(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(waiverService.getDocumentsForPlayer(user.getUsername()));
    }

    @GetMapping("/api/admin/documents/player/{email}")
    public ResponseEntity<List<PlayerDocumentResponse>> getPlayerDocuments(@PathVariable String email) {
        return ResponseEntity.ok(waiverService.getDocumentsForPlayer(email));
    }

    @DeleteMapping("/api/admin/documents/{id}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        waiverService.deleteDocument(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }
}
