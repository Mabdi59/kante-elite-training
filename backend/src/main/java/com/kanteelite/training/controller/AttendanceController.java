package com.kanteelite.training.controller;

import jakarta.validation.Valid;
import com.kanteelite.training.dto.request.AttendanceRequest;
import com.kanteelite.training.dto.response.AttendanceResponse;
import com.kanteelite.training.service.AttendanceService;
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
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping
    public ResponseEntity<AttendanceResponse> upsertAttendance(
            @Valid @RequestBody AttendanceRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(attendanceService.upsertAttendance(request, user.getUsername()));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<AttendanceResponse>> getByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(attendanceService.getByBookingId(bookingId));
    }

    @GetMapping("/player")
    public ResponseEntity<List<AttendanceResponse>> getMyAttendance(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(attendanceService.getByPlayerEmail(user.getUsername()));
    }

    @GetMapping("/player/{email}")
    public ResponseEntity<List<AttendanceResponse>> getByPlayerEmail(@PathVariable String email) {
        return ResponseEntity.ok(attendanceService.getByPlayerEmail(email));
    }

    @GetMapping("/player/{email}/summary")
    public ResponseEntity<Map<String, Long>> getSummary(@PathVariable String email) {
        return ResponseEntity.ok(attendanceService.getAttendanceSummaryForPlayer(email));
    }

    @GetMapping("/range")
    public ResponseEntity<List<AttendanceResponse>> getByRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String playerEmail) {
        return ResponseEntity.ok(attendanceService.getByDateRange(from, to, playerEmail));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttendance(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        attendanceService.deleteAttendance(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }
}
