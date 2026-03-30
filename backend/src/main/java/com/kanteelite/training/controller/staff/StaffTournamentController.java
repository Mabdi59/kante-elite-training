package com.kanteelite.training.controller.staff;

import com.kanteelite.training.dto.request.RegistrationPaymentStatusRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.TeamRegistrationResponse;
import com.kanteelite.training.dto.response.TournamentResponse;
import com.kanteelite.training.service.TournamentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff/tournaments")
@RequiredArgsConstructor
public class StaffTournamentController {

    private final TournamentService tournamentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TournamentResponse>>> getAllTournaments() {
        return ResponseEntity.ok(ApiResponse.success(tournamentService.getAllTournaments()));
    }

    @GetMapping("/{id}/registrations")
    public ResponseEntity<ApiResponse<List<TeamRegistrationResponse>>> getRegistrations(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(tournamentService.getRegistrationsForTournament(id)));
    }

    @PatchMapping("/registrations/{regId}/status")
    public ResponseEntity<ApiResponse<TeamRegistrationResponse>> updateRegistrationStatus(
            @PathVariable Long regId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success(
                "Registration status updated.",
                tournamentService.updateRegistrationStatus(
                        regId,
                        body.get("status"),
                        principal != null ? principal.getUsername() : null)));
    }

    @PatchMapping("/registrations/{regId}/payment")
    public ResponseEntity<ApiResponse<TeamRegistrationResponse>> updateRegistrationPaymentStatus(
            @PathVariable Long regId,
            @Valid @RequestBody RegistrationPaymentStatusRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success(
                "Registration payment status updated.",
                tournamentService.updateRegistrationPaymentStatus(
                        regId,
                        request.getPaymentStatus(),
                        principal != null ? principal.getUsername() : null)));
    }
}
