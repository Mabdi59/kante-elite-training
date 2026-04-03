package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.request.BookingRequest;
import com.kanteelite.training.dto.request.RescheduleRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.BookingResponse;
import com.kanteelite.training.service.BookingService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
public class AdminBookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingRequest request) {
        BookingResponse booking = bookingService.createBooking(request);
        return ResponseEntity.ok(ApiResponse.success("Booking created successfully.", booking));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String date) {
        List<BookingResponse> all = bookingService.getAllBookings();
        List<BookingResponse> filtered = all.stream()
                .filter(b -> status == null || b.getBookingStatus().name().equalsIgnoreCase(status))
                .filter(b -> date == null || b.getBookingDate().toString().equals(date))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(filtered));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBooking(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getById(id)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails principal) {
        String status = body.get("status");
        String actor = principal != null ? principal.getUsername() : "admin";
        return ResponseEntity.ok(ApiResponse.success("Booking status updated.",
                bookingService.updateStatus(id, status, actor)));
    }

    @PatchMapping("/{id}/reschedule")
    public ResponseEntity<ApiResponse<BookingResponse>> reschedule(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        String actor = principal != null ? principal.getUsername() : "admin";
        return ResponseEntity.ok(ApiResponse.success("Booking rescheduled.",
                bookingService.reschedule(id, request, actor)));
    }

    @GetMapping("/export.csv")
    public void exportCsv(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"bookings.csv\"");

        List<BookingResponse> bookings = bookingService.getAllBookings();

        try (PrintWriter writer = response.getWriter()) {
            writer.println("ID,Player Name,Program,Date,Time,Email,Phone,Status,Created At");
            for (BookingResponse b : bookings) {
                writer.printf("%d,\"%s\",\"%s\",%s,%s,\"%s\",\"%s\",%s,%s%n",
                        b.getId(),
                        escape(b.getPlayerName()),
                        escape(b.getProgramName()),
                        b.getBookingDate(),
                        b.getBookingTime(),
                        escape(b.getEmail()),
                        escape(b.getPhone()),
                        b.getBookingStatus(),
                        b.getCreatedAt()
                );
            }
        }
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\"", "\"\"");
    }
}
