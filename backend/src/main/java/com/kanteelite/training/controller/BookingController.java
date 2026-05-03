package com.kanteelite.training.controller;

import com.kanteelite.training.dto.request.PublicProgramRegistrationRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.RegistrationResponse;
import com.kanteelite.training.enums.RegistrationStatus;
import com.kanteelite.training.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class BookingController {

    private final RegistrationService registrationService;

    @PostMapping("/api/bookings")
    public ResponseEntity<ApiResponse<RegistrationResponse>> createBooking(
            @Valid @RequestBody PublicProgramRegistrationRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        RegistrationResponse registration = registrationService.createPublicProgramBooking(
                request,
                principal != null ? principal.getUsername() : null);
        String message = registration.getStatus() == RegistrationStatus.WAITLISTED
                ? "This session is full, so you have been added to the waitlist."
                : registration.isConfirmationEmailAvailable()
                ? "Booking confirmed successfully. A confirmation email has been sent."
                : "Booking confirmed successfully. Email confirmations are not available right now.";

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(message, registration));
    }
}
