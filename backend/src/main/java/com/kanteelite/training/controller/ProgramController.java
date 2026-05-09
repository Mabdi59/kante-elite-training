package com.kanteelite.training.controller;

import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.ProgramResponse;
import com.kanteelite.training.dto.response.SessionResponse;
import com.kanteelite.training.service.ProgramService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/programs")
@RequiredArgsConstructor
public class ProgramController {

    private final ProgramService programService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProgramResponse>>> getAllPrograms() {
        return ResponseEntity.ok(ApiResponse.success(programService.getAllActivePrograms()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProgramResponse>> getProgramById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(programService.getProgramById(id)));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ProgramResponse>> getProgramBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(programService.getProgramBySlug(slug)));
    }

    @GetMapping("/{id}/sessions")
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getProgramSessions(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(programService.getProgramSessions(id, true)));
    }
}
