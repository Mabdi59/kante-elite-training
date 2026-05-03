package com.kanteelite.training.controller;

import com.kanteelite.training.dto.request.ChangePasswordRequest;
import com.kanteelite.training.dto.request.PlayerProfileRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.PlayerProfileResponse;
import com.kanteelite.training.dto.response.RegistrationResponse;
import com.kanteelite.training.service.PlayerProfileService;
import com.kanteelite.training.service.RegistrationService;
import com.kanteelite.training.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {

    private final RegistrationService registrationService;
    private final PlayerProfileService playerProfileService;
    private final UserService userService;

    @GetMapping("/registrations")
    public ResponseEntity<ApiResponse<List<RegistrationResponse>>> getMyRegistrations(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success(
                registrationService.getAccountRegistrations(principal.getUsername())));
    }

    @PatchMapping("/registrations/{id}/cancel")
    public ResponseEntity<ApiResponse<RegistrationResponse>> cancelRegistration(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        RegistrationResponse response = registrationService.cancelOwnRegistration(id, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Registration cancelled.", response));
    }

    @PatchMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        userService.changePassword(principal.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Password updated successfully.", null));
    }

    @GetMapping("/players")
    public ResponseEntity<ApiResponse<List<PlayerProfileResponse>>> getMyPlayers(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success(
                playerProfileService.getMyPlayers(principal.getUsername())));
    }

    @PostMapping("/players")
    public ResponseEntity<ApiResponse<PlayerProfileResponse>> addPlayer(
            @Valid @RequestBody PlayerProfileRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        PlayerProfileResponse created = playerProfileService.create(principal.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Player profile created.", created));
    }

    @PutMapping("/players/{id}")
    public ResponseEntity<ApiResponse<PlayerProfileResponse>> updatePlayer(
            @PathVariable Long id,
            @Valid @RequestBody PlayerProfileRequest request,
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
