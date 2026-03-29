package com.kanteelite.training.controller;

import com.kanteelite.training.dto.request.CoachProfileRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.BookingResponse;
import com.kanteelite.training.dto.response.CoachProfileResponse;
import com.kanteelite.training.service.CoachProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coach")
@RequiredArgsConstructor
public class CoachController {

    private final CoachProfileService coachProfileService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<CoachProfileResponse>> getMyProfile(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success(
                coachProfileService.getByUserEmail(principal.getUsername())));
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

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<CoachProfileResponse>>> getPublicCoaches() {
        return ResponseEntity.ok(ApiResponse.success(coachProfileService.getActiveCoaches()));
    }
}
