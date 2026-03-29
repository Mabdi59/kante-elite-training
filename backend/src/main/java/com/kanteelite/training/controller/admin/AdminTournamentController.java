package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.TeamRegistrationResponse;
import com.kanteelite.training.service.TournamentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/tournaments")
@RequiredArgsConstructor
public class AdminTournamentController {

    private final TournamentService tournamentService;

    @PatchMapping("/registrations/{regId}/status")
    public ResponseEntity<ApiResponse<TeamRegistrationResponse>> updateRegistrationStatus(
            @PathVariable Long regId,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(ApiResponse.success("Registration status updated.",
                tournamentService.updateRegistrationStatus(regId, status)));
    }
}
