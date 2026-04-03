package com.kanteelite.training.controller;

import com.kanteelite.training.dto.request.BookingRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.BookingResponse;
import com.kanteelite.training.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

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
    public ResponseEntity<ApiResponse<BookingResponse>> getBooking(@PathVariable Long id) {
        BookingResponse booking = bookingService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(booking));
    }
}
