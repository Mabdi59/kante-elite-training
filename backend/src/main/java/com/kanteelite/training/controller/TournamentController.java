package com.kanteelite.training.controller;

import com.kanteelite.training.dto.request.TeamRegistrationRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.TeamRegistrationResponse;
import com.kanteelite.training.dto.response.TournamentResponse;
import com.kanteelite.training.dto.response.TournamentWorkflowResponse;
import com.kanteelite.training.dto.request.TournamentRequest;
import com.kanteelite.training.service.TournamentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tournaments")
@RequiredArgsConstructor
public class TournamentController {

    private final TournamentService tournamentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TournamentResponse>>> getAllTournaments() {
        return ResponseEntity.ok(ApiResponse.success(tournamentService.getAllTournaments()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TournamentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(tournamentService.getById(id)));
    }

    @GetMapping("/{id}/public")
    public ResponseEntity<ApiResponse<TournamentWorkflowResponse>> getPublicView(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(tournamentService.getAdminWorkflow(id)));
    }

    @GetMapping("/{id}/registrations")
    public ResponseEntity<ApiResponse<List<TeamRegistrationResponse>>> getRegistrations(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(tournamentService.getRegistrationsForTournament(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TournamentResponse>> create(@Valid @RequestBody TournamentRequest request) {
        TournamentResponse created = tournamentService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Tournament created.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TournamentResponse>> update(@PathVariable Long id, @Valid @RequestBody TournamentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tournament updated.", tournamentService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        tournamentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Tournament deleted.", null));
    }
}
