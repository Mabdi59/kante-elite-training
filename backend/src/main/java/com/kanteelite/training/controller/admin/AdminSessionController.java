package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.RegistrationResponse;
import com.kanteelite.training.dto.response.SessionResponse;
import com.kanteelite.training.service.RegistrationService;
import com.kanteelite.training.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/sessions")
@RequiredArgsConstructor
public class AdminSessionController {

    private final SessionService sessionService;
    private final RegistrationService registrationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getSessions() {
        return ResponseEntity.ok(ApiResponse.success(sessionService.getAllSessions()));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<SessionResponse>> cancelSession(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Session cancelled.", sessionService.cancelSession(id)));
    }

    @GetMapping("/{id}/registrations")
    public ResponseEntity<ApiResponse<List<RegistrationResponse>>> getSessionRegistrations(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(registrationService.getRegistrationsForSession(id)));
    }
}
