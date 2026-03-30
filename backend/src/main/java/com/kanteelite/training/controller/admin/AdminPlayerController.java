package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.request.AdminPlayerProfileRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.PlayerProfileResponse;
import com.kanteelite.training.service.PlayerProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/players")
@RequiredArgsConstructor
public class AdminPlayerController {

    private final PlayerProfileService playerProfileService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PlayerProfileResponse>>> getAllPlayers() {
        return ResponseEntity.ok(ApiResponse.success(playerProfileService.getAllPlayers()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PlayerProfileResponse>> createPlayer(
            @Valid @RequestBody AdminPlayerProfileRequest request) {
        PlayerProfileResponse created = playerProfileService.createForAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Player profile created.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PlayerProfileResponse>> updatePlayer(
            @PathVariable Long id,
            @Valid @RequestBody AdminPlayerProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Player profile updated.",
                playerProfileService.updateForAdmin(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePlayer(@PathVariable Long id) {
        playerProfileService.deleteForAdmin(id);
        return ResponseEntity.ok(ApiResponse.success("Player profile deleted.", null));
    }
}
