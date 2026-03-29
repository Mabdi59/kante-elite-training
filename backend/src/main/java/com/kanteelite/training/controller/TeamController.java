package com.kanteelite.training.controller;

import com.kanteelite.training.dto.request.TeamRegistrationRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.TeamRegistrationResponse;
import com.kanteelite.training.service.TournamentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TournamentService tournamentService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<TeamRegistrationResponse>> register(
            @Valid @RequestBody TeamRegistrationRequest request) {
        TeamRegistrationResponse response = tournamentService.registerTeam(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Team registered successfully.", response));
    }
}
