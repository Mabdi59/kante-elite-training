package com.kanteelite.training.controller;

import com.kanteelite.training.dto.request.ManualTournamentPaymentRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.TournamentPaymentCheckoutResponse;
import com.kanteelite.training.dto.response.TournamentRegistrationDashboardResponse;
import com.kanteelite.training.service.TournamentRegistrationFileStorageService;
import com.kanteelite.training.service.TournamentPaymentService;
import com.kanteelite.training.service.TournamentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/tournaments/registrations/access")
@RequiredArgsConstructor
public class TournamentRegistrationAccessController {

    private final TournamentService tournamentService;
    private final TournamentPaymentService tournamentPaymentService;

    @GetMapping("/{token}")
    public ResponseEntity<ApiResponse<TournamentRegistrationDashboardResponse>> getDashboard(
            @PathVariable String token) {
        return ResponseEntity.ok(ApiResponse.success(tournamentService.getPublicRegistrationDashboard(token)));
    }

    @GetMapping("/{token}/roster/download")
    public ResponseEntity<Resource> downloadRoster(@PathVariable String token) {
        TournamentRegistrationFileStorageService.StoredFileResource file =
                tournamentService.getRosterDownload(token);

        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(file.getContentType());
        } catch (IllegalArgumentException ignored) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(file.getFileName(), StandardCharsets.UTF_8)
                        .build()
                        .toString())
                .body(new FileSystemResource(file.getPath()));
    }

    @PostMapping(value = "/{token}/roster", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<TournamentRegistrationDashboardResponse>> submitRoster(
            @PathVariable String token,
            @RequestPart(value = "rosterText", required = false) String rosterText,
            @RequestPart(value = "rosterFile", required = false) MultipartFile rosterFile) {
        return ResponseEntity.ok(ApiResponse.success(
                "Roster submitted.",
                tournamentService.submitRoster(token, rosterText, rosterFile)));
    }

    @PostMapping("/{token}/payment/manual")
    public ResponseEntity<ApiResponse<TournamentRegistrationDashboardResponse>> submitManualPayment(
            @PathVariable String token,
            @Valid @org.springframework.web.bind.annotation.RequestBody ManualTournamentPaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Payment submission received.",
                tournamentService.submitManualPayment(token, request)));
    }

    @PostMapping("/{token}/payment/checkout")
    public ResponseEntity<ApiResponse<TournamentPaymentCheckoutResponse>> createCheckout(
            @PathVariable String token) {
        return ResponseEntity.ok(ApiResponse.success(
                "Payment checkout created.",
                tournamentPaymentService.createCheckoutSession(token)));
    }
}
