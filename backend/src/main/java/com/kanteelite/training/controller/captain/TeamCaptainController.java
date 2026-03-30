package com.kanteelite.training.controller.captain;

import com.kanteelite.training.dto.request.TeamRegistrationRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.TeamCaptainDashboardResponse;
import com.kanteelite.training.dto.response.TeamRegistrationResponse;
import com.kanteelite.training.service.TournamentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/captain")
@RequiredArgsConstructor
public class TeamCaptainController {

    private final TournamentService tournamentService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<TeamCaptainDashboardResponse>> getDashboard(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success(
                tournamentService.getCaptainDashboard(principal.getUsername())));
    }

    @GetMapping("/registrations")
    public ResponseEntity<ApiResponse<List<TeamRegistrationResponse>>> getMyRegistrations(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success(
                tournamentService.getRegistrationsForCaptain(principal.getUsername())));
    }

    @PostMapping("/registrations")
    public ResponseEntity<ApiResponse<TeamRegistrationResponse>> createRegistration(
            @Valid @RequestBody TeamRegistrationRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        TeamRegistrationResponse response =
                tournamentService.registerTeamForUser(request, principal.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Team registered successfully.", response));
    }

    @PutMapping("/registrations/{id}")
    public ResponseEntity<ApiResponse<TeamRegistrationResponse>> updateRegistration(
            @PathVariable Long id,
            @Valid @RequestBody TeamRegistrationRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        TeamRegistrationResponse response =
                tournamentService.updateCaptainRegistration(id, principal.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Registration updated.", response));
    }

    @DeleteMapping("/registrations/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRegistration(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        tournamentService.deleteCaptainRegistration(id, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Registration removed.", null));
    }
}
