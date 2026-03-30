package com.kanteelite.training.controller.staff;

import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.PlayerProfileResponse;
import com.kanteelite.training.service.PlayerProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/staff/players")
@RequiredArgsConstructor
public class StaffPlayerController {

    private final PlayerProfileService playerProfileService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PlayerProfileResponse>>> getAllPlayers() {
        return ResponseEntity.ok(ApiResponse.success(playerProfileService.getAllPlayers()));
    }
}
