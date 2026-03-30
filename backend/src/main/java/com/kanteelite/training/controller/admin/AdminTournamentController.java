package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.request.AdminTeamRegistrationRequest;
import com.kanteelite.training.dto.request.RegistrationPaymentStatusRequest;
import com.kanteelite.training.dto.request.TeamPlayerRequest;
import com.kanteelite.training.dto.request.TournamentMatchRequest;
import com.kanteelite.training.dto.request.TournamentRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.TeamPlayerResponse;
import com.kanteelite.training.dto.response.TeamRegistrationResponse;
import com.kanteelite.training.dto.response.TournamentMatchResponse;
import com.kanteelite.training.dto.response.TournamentResponse;
import com.kanteelite.training.dto.response.TournamentWorkflowResponse;
import com.kanteelite.training.service.TournamentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/tournaments")
@RequiredArgsConstructor
public class AdminTournamentController {

    private final TournamentService tournamentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TournamentResponse>>> getAllTournaments() {
        return ResponseEntity.ok(ApiResponse.success(tournamentService.getAllTournaments()));
    }

    @GetMapping("/{id}/workflow")
    public ResponseEntity<ApiResponse<TournamentWorkflowResponse>> getWorkflow(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(tournamentService.getAdminWorkflow(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TournamentResponse>> createTournament(
            @Valid @RequestBody TournamentRequest request) {
        TournamentResponse created = tournamentService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tournament created.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TournamentResponse>> updateTournament(
            @PathVariable Long id,
            @Valid @RequestBody TournamentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Tournament updated.",
                tournamentService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTournament(@PathVariable Long id) {
        tournamentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Tournament deleted.", null));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<ApiResponse<TournamentResponse>> duplicateTournament(
            @PathVariable Long id,
            @RequestParam(name = "includeData", defaultValue = "false") boolean includeData,
            @AuthenticationPrincipal UserDetails principal) {
        TournamentResponse duplicated = tournamentService.duplicate(
                id,
                includeData,
                principal != null ? principal.getUsername() : null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        includeData ? "Tournament duplicated with data." : "Tournament duplicated without data.",
                        duplicated));
    }

    @PostMapping("/registrations")
    public ResponseEntity<ApiResponse<TeamRegistrationResponse>> createRegistration(
            @Valid @RequestBody AdminTeamRegistrationRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        TeamRegistrationResponse created = tournamentService.createAdminRegistration(
                request,
                principal != null ? principal.getUsername() : null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration created.", created));
    }

    @PutMapping("/registrations/{regId}")
    public ResponseEntity<ApiResponse<TeamRegistrationResponse>> updateRegistration(
            @PathVariable Long regId,
            @Valid @RequestBody AdminTeamRegistrationRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success(
                "Registration updated.",
                tournamentService.updateAdminRegistration(
                        regId,
                        request,
                        principal != null ? principal.getUsername() : null)));
    }

    @DeleteMapping("/registrations/{regId}")
    public ResponseEntity<ApiResponse<Void>> deleteRegistration(
            @PathVariable Long regId,
            @AuthenticationPrincipal UserDetails principal) {
        tournamentService.deleteAdminRegistration(regId, principal != null ? principal.getUsername() : null);
        return ResponseEntity.ok(ApiResponse.success("Registration deleted.", null));
    }

    @PatchMapping("/registrations/{regId}/status")
    public ResponseEntity<ApiResponse<TeamRegistrationResponse>> updateRegistrationStatus(
            @PathVariable Long regId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails principal) {
        String status = body.get("status");
        return ResponseEntity.ok(ApiResponse.success("Registration status updated.",
                tournamentService.updateRegistrationStatus(regId, status,
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

    @PostMapping("/{id}/teams/{teamId}/players")
    public ResponseEntity<ApiResponse<TeamPlayerResponse>> createTeamPlayer(
            @PathVariable Long id,
            @PathVariable Long teamId,
            @Valid @RequestBody TeamPlayerRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        TeamPlayerResponse created = tournamentService.createTeamPlayer(
                id,
                teamId,
                request,
                principal != null ? principal.getUsername() : null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Team player created.", created));
    }

    @PutMapping("/{id}/teams/{teamId}/players/{playerId}")
    public ResponseEntity<ApiResponse<TeamPlayerResponse>> updateTeamPlayer(
            @PathVariable Long id,
            @PathVariable Long teamId,
            @PathVariable Long playerId,
            @Valid @RequestBody TeamPlayerRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success(
                "Team player updated.",
                tournamentService.updateTeamPlayer(
                        id,
                        teamId,
                        playerId,
                        request,
                        principal != null ? principal.getUsername() : null)));
    }

    @DeleteMapping("/{id}/teams/{teamId}/players/{playerId}")
    public ResponseEntity<ApiResponse<Void>> deleteTeamPlayer(
            @PathVariable Long id,
            @PathVariable Long teamId,
            @PathVariable Long playerId,
            @AuthenticationPrincipal UserDetails principal) {
        tournamentService.deleteTeamPlayer(
                id,
                teamId,
                playerId,
                principal != null ? principal.getUsername() : null);
        return ResponseEntity.ok(ApiResponse.success("Team player deleted.", null));
    }

    @PostMapping("/{id}/matches")
    public ResponseEntity<ApiResponse<TournamentMatchResponse>> createMatch(
            @PathVariable Long id,
            @Valid @RequestBody TournamentMatchRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        TournamentMatchResponse created = tournamentService.createMatch(
                id,
                request,
                principal != null ? principal.getUsername() : null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Match created.", created));
    }

    @PutMapping("/{id}/matches/{matchId}")
    public ResponseEntity<ApiResponse<TournamentMatchResponse>> updateMatch(
            @PathVariable Long id,
            @PathVariable Long matchId,
            @Valid @RequestBody TournamentMatchRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success(
                "Match updated.",
                tournamentService.updateMatch(
                        id,
                        matchId,
                        request,
                        principal != null ? principal.getUsername() : null)));
    }

    @DeleteMapping("/{id}/matches/{matchId}")
    public ResponseEntity<ApiResponse<Void>> deleteMatch(
            @PathVariable Long id,
            @PathVariable Long matchId,
            @AuthenticationPrincipal UserDetails principal) {
        tournamentService.deleteMatch(id, matchId, principal != null ? principal.getUsername() : null);
        return ResponseEntity.ok(ApiResponse.success("Match deleted.", null));
    }

    @PostMapping("/{id}/matches/generate")
    public ResponseEntity<ApiResponse<List<TournamentMatchResponse>>> generateMatches(
            @PathVariable Long id,
            @RequestParam(name = "overwrite", defaultValue = "false") boolean overwrite,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success(
                "Schedule generated.",
                tournamentService.generateSchedule(
                        id,
                        overwrite,
                        principal != null ? principal.getUsername() : null)));
    }
}
