package com.kanteelite.training.controller;

import com.kanteelite.training.dto.request.CoachProfileRequest;
import com.kanteelite.training.dto.request.RescheduleRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.BookingResponse;
import com.kanteelite.training.dto.response.BookingSeriesResponse;
import com.kanteelite.training.dto.response.CoachProfileResponse;
import com.kanteelite.training.entity.User;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.BookingRepository;
import com.kanteelite.training.repository.UserRepository;
import com.kanteelite.training.service.BookingService;
import com.kanteelite.training.service.CoachProfileService;
import com.kanteelite.training.service.RecurringScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/coach")
@RequiredArgsConstructor
public class CoachController {

    private final CoachProfileService coachProfileService;
    private final BookingService bookingService;
    private final RecurringScheduleService recurringScheduleService;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<CoachProfileResponse>> getMyProfile(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success(
                coachProfileService.getOptionalByUserEmail(principal.getUsername())));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<CoachProfileResponse>> updateMyProfile(
            @RequestBody CoachProfileRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated.",
                coachProfileService.updateSelf(principal.getUsername(), request)));
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMySessions(
            @AuthenticationPrincipal UserDetails principal) {
        List<BookingResponse> sessions = coachProfileService.getAssignedSessions(principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    @PatchMapping("/sessions/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateSessionStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success(
                "Session status updated.",
                bookingService.updateCoachSessionStatus(id, body.get("status"), principal.getUsername())));
    }

    @PatchMapping("/sessions/{id}/reschedule")
    public ResponseEntity<ApiResponse<BookingResponse>> rescheduleSession(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success(
                "Session rescheduled.",
                bookingService.rescheduleCoachSession(id, request, principal.getUsername())));
    }

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<CoachProfileResponse>>> getPublicCoaches() {
        return ResponseEntity.ok(ApiResponse.success(coachProfileService.getActiveCoaches()));
    }

    @GetMapping("/schedule/week")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getWeekSchedule(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @AuthenticationPrincipal UserDetails principal) {
        User coach = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + principal.getUsername()));
        LocalDate start = startDate != null ? startDate : LocalDate.now().with(java.time.DayOfWeek.MONDAY);
        LocalDate end = start.plusDays(6);
        List<BookingResponse> bookings = bookingRepository
                .findByCoachUserIdAndDateRange(coach.getId(), start, end)
                .stream()
                .map(b -> BookingResponse.builder()
                        .id(b.getId())
                        .programId(b.getProgram() != null ? b.getProgram().getId() : null)
                        .programName(b.getProgram() != null ? b.getProgram().getName() : null)
                        .bookingDate(b.getBookingDate())
                        .bookingTime(b.getBookingTime())
                        .playerName(b.getPlayerName())
                        .playerAge(b.getPlayerAge())
                        .parentName(b.getParentName())
                        .email(b.getEmail())
                        .phone(b.getPhone())
                        .bookingStatus(b.getBookingStatus())
                        .paymentStatus(b.getPaymentStatus())
                        .notes(b.getNotes())
                        .createdAt(b.getCreatedAt())
                        .build())
                .toList();
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @GetMapping("/recurring-schedules")
    public ResponseEntity<ApiResponse<List<BookingSeriesResponse>>> getMyRecurringSchedules(
            @AuthenticationPrincipal UserDetails principal) {
        User coach = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + principal.getUsername()));
        return ResponseEntity.ok(ApiResponse.success(recurringScheduleService.getSeriesByCoach(coach.getId())));
    }
}
