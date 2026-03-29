package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.PlayerProfileResponse;
import com.kanteelite.training.service.PlayerProfileService;
import lombok.RequiredArgsConstructor;
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
}
