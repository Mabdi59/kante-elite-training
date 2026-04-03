package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.BookingResponse;
import com.kanteelite.training.service.BookingService;
import com.kanteelite.training.service.RefundService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Payment history and refund endpoints.
 * <p>
 * Admin-scoped endpoints live under {@code /api/admin/payments} and are protected
 * by the existing security rule {@code /api/admin/**→ADMIN}.
 * The authenticated user endpoint at {@code GET /api/payments/my} requires only
 * a valid JWT (added to SecurityConfig before the broad payments permitAll).
 */
@RestController
@RequiredArgsConstructor
public class AdminPaymentController {

    private final BookingService bookingService;
    private final RefundService refundService;

    /** Returns all bookings with payment information (admin only). */
    @GetMapping("/api/admin/payments")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllPayments() {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getAllBookings()));
    }

    /** Returns the authenticated user's own payment/booking history. */
    @GetMapping("/api/payments/my")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyPayments(
            @AuthenticationPrincipal UserDetails principal) {
        String email = principal.getUsername();
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBookingsByEmail(email)));
    }

    /** Refunds a booking; issues a Stripe refund if Stripe is configured (admin only). */
    @PostMapping("/api/admin/payments/refund/{bookingId}")
    public ResponseEntity<ApiResponse<BookingResponse>> refundBooking(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal UserDetails principal) {
        String actor = principal != null ? principal.getUsername() : "admin";
        BookingResponse response = refundService.refundBooking(bookingId, actor);
        return ResponseEntity.ok(ApiResponse.success("Booking refunded successfully.", response));
    }
}
