package com.kanteelite.training.controller;

import com.kanteelite.training.dto.request.RegistrationRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.RegistrationResponse;
import com.kanteelite.training.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping
    public ResponseEntity<ApiResponse<RegistrationResponse>> register(
            @RequestParam Long sessionId,
            @RequestBody RegistrationRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        RegistrationResponse registration = registrationService.register(
                sessionId,
                request,
                principal != null ? principal.getUsername() : null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration submitted.", registration));
    }
}
