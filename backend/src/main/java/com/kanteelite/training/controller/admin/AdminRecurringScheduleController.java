package com.kanteelite.training.controller.admin;

import jakarta.validation.Valid;
import com.kanteelite.training.dto.request.SessionSeriesRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.SessionSeriesPreviewItem;
import com.kanteelite.training.dto.response.SessionSeriesResponse;
import com.kanteelite.training.dto.response.TrainingSessionResponse;
import com.kanteelite.training.service.SessionSeriesService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/recurring-schedules")
@RequiredArgsConstructor
public class AdminRecurringScheduleController {

    private final SessionSeriesService sessionSeriesService;

    @PostMapping("/preview")
    public ResponseEntity<ApiResponse<List<SessionSeriesPreviewItem>>> previewSeries(
            @Valid @RequestBody SessionSeriesRequest request) {
        return ResponseEntity.ok(ApiResponse.success(sessionSeriesService.previewSeries(request)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SessionSeriesResponse>> createSeries(
            @Valid @RequestBody SessionSeriesRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        String actor = principal != null ? principal.getUsername() : "admin";
        return ResponseEntity.ok(ApiResponse.success("Recurring schedule created.",
                sessionSeriesService.createSeries(request, actor)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SessionSeriesResponse>>> getAllSeries() {
        return ResponseEntity.ok(ApiResponse.success(sessionSeriesService.getAllSeries()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SessionSeriesResponse>> getSeries(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(sessionSeriesService.getSeries(id)));
    }

    @GetMapping("/{id}/sessions")
    public ResponseEntity<ApiResponse<List<TrainingSessionResponse>>> getGeneratedSessions(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(sessionSeriesService.getGeneratedSessions(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SessionSeriesResponse>> updateSeries(
            @PathVariable Long id,
            @Valid @RequestBody SessionSeriesRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        String actor = principal != null ? principal.getUsername() : "admin";
        return ResponseEntity.ok(ApiResponse.success("Recurring schedule updated.",
                sessionSeriesService.updateSeries(id, request, actor)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSeries(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        String actor = principal != null ? principal.getUsername() : "admin";
        sessionSeriesService.deleteSeries(id, actor);
        return ResponseEntity.ok(ApiResponse.success("Series deleted and future sessions cancelled.", null));
    }

    @PostMapping("/{id}/cancel-future")
    public ResponseEntity<ApiResponse<Void>> cancelFutureSessions(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserDetails principal) {
        String actor = principal != null ? principal.getUsername() : "admin";
        LocalDate fromDate = body != null && body.containsKey("fromDate")
                ? LocalDate.parse(body.get("fromDate"))
                : LocalDate.now();
        sessionSeriesService.cancelFutureSessions(id, fromDate, actor);
        return ResponseEntity.ok(ApiResponse.success("Future sessions cancelled.", null));
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<Void>> cancelSession(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserDetails principal) {
        String actor = principal != null ? principal.getUsername() : "admin";
        sessionSeriesService.cancelSession(sessionId, actor);
        return ResponseEntity.ok(ApiResponse.success("Session cancelled.", null));
    }

}
