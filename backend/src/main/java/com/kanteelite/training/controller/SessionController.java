package com.kanteelite.training.controller;

import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.SessionResponse;
import com.kanteelite.training.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getUpcomingSessions() {
        return ResponseEntity.ok(ApiResponse.success(sessionService.getUpcomingSessions()));
    }
}
