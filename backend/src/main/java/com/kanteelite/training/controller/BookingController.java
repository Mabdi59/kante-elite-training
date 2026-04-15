package com.kanteelite.training.controller;

import com.kanteelite.training.dto.request.BookingRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.BookingResponse;
import com.kanteelite.training.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private static final Set<String> PRIVILEGED_ROLES = Set.of(
            "ROLE_ADMIN", "ROLE_STAFF", "ROLE_COACH");

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        BookingResponse booking = bookingService.createBooking(
                request, principal != null ? principal.getUsername() : null);
        String message = booking.isConfirmationEmailAvailable()
                ? "Booking confirmed successfully. A confirmation email has been sent."
                : "Booking confirmed successfully. Email confirmations are not available right now.";
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(message, booking));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        BookingResponse booking = bookingService.getById(id);
        if (principal != null && !isOwnerOrPrivileged(principal, booking.getEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied."));
        }
        return ResponseEntity.ok(ApiResponse.success(booking));
    }

    /**
     * Used by the Stripe success redirect page to load booking details by Stripe session ID.
     * The Stripe session ID is an opaque random string, making enumeration attacks impractical.
     * The webhook may have a slight processing delay, so the client may need to retry briefly.
     */
    @GetMapping("/by-stripe-session/{sessionId}")
    public ResponseEntity<ApiResponse<BookingResponse>> getByStripeSession(@PathVariable String sessionId) {
        BookingResponse booking = bookingService.getByStripeSessionId(sessionId);
        if (booking == null) {
            return ResponseEntity.ok(ApiResponse.success(null));
        }
        return ResponseEntity.ok(ApiResponse.success(booking));
    }

    private boolean isOwnerOrPrivileged(UserDetails principal, String bookingEmail) {
        if (principal.getUsername().equals(bookingEmail)) {
            return true;
        }
        return principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(PRIVILEGED_ROLES::contains);
    }
}
