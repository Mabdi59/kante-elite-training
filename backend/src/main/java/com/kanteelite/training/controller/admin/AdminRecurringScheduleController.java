package com.kanteelite.training.controller.admin;

import jakarta.validation.Valid;
import com.kanteelite.training.dto.request.BookingSeriesRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.BookingSeriesPreviewItem;
import com.kanteelite.training.dto.response.BookingSeriesResponse;
import com.kanteelite.training.service.RecurringScheduleService;
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

    private final RecurringScheduleService recurringScheduleService;

    @PostMapping("/preview")
    public ResponseEntity<ApiResponse<List<BookingSeriesPreviewItem>>> previewSeries(
            @Valid @RequestBody BookingSeriesRequest request) {
        return ResponseEntity.ok(ApiResponse.success(recurringScheduleService.previewSeries(request)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingSeriesResponse>> createSeries(
            @Valid @RequestBody BookingSeriesRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        String actor = principal != null ? principal.getUsername() : "admin";
        return ResponseEntity.ok(ApiResponse.success("Recurring schedule created.",
                recurringScheduleService.createSeries(request, actor)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingSeriesResponse>>> getAllSeries() {
        return ResponseEntity.ok(ApiResponse.success(recurringScheduleService.getAllSeries()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingSeriesResponse>> getSeries(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(recurringScheduleService.getSeries(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSeries(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        String actor = principal != null ? principal.getUsername() : "admin";
        recurringScheduleService.deleteSeries(id, actor);
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
        recurringScheduleService.cancelFutureSessions(id, fromDate, actor);
        return ResponseEntity.ok(ApiResponse.success("Future sessions cancelled.", null));
    }

    @DeleteMapping("/sessions/{bookingId}")
    public ResponseEntity<ApiResponse<Void>> cancelSession(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal UserDetails principal) {
        String actor = principal != null ? principal.getUsername() : "admin";
        recurringScheduleService.cancelSession(bookingId, actor);
        return ResponseEntity.ok(ApiResponse.success("Session cancelled.", null));
    }
}
