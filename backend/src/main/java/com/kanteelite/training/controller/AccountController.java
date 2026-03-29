package com.kanteelite.training.controller;

import com.kanteelite.training.dto.request.PlayerProfileRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.BookingResponse;
import com.kanteelite.training.dto.response.PlayerProfileResponse;
import com.kanteelite.training.service.BookingService;
import com.kanteelite.training.service.PlayerProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {

    private final BookingService bookingService;
    private final PlayerProfileService playerProfileService;

    // ─── Bookings ─────────────────────────────────────────────────────────────

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(
            @AuthenticationPrincipal UserDetails principal) {
        List<BookingResponse> bookings = bookingService.getBookingsByEmail(principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @PatchMapping("/bookings/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        BookingResponse response = bookingService.cancelOwnBooking(id, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled.", response));
    }

    // ─── Player Profiles ──────────────────────────────────────────────────────

    @GetMapping("/players")
    public ResponseEntity<ApiResponse<List<PlayerProfileResponse>>> getMyPlayers(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success(
                playerProfileService.getMyPlayers(principal.getUsername())));
    }

    @PostMapping("/players")
    public ResponseEntity<ApiResponse<PlayerProfileResponse>> addPlayer(
            @RequestBody PlayerProfileRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        PlayerProfileResponse created = playerProfileService.create(principal.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Player profile created.", created));
    }

    @PutMapping("/players/{id}")
    public ResponseEntity<ApiResponse<PlayerProfileResponse>> updatePlayer(
            @PathVariable Long id,
            @RequestBody PlayerProfileRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Player profile updated.",
                playerProfileService.update(id, principal.getUsername(), request)));
    }

    @DeleteMapping("/players/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePlayer(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        playerProfileService.delete(id, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Player profile removed.", null));
    }
}
