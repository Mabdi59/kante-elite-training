package com.kanteelite.training.controller;

import com.kanteelite.training.dto.request.PublicProgramRegistrationRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.RegistrationResponse;
import com.kanteelite.training.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @GetMapping("/by-stripe-session/{sessionId}")
    public ResponseEntity<ApiResponse<RegistrationResponse>> getByStripeSession(@PathVariable String sessionId) {
        return ResponseEntity.ok(ApiResponse.success(registrationService.getPublicRegistrationByStripeSession(sessionId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RegistrationResponse>> getRegistration(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(registrationService.getPublicRegistration(id)));
    }

    @GetMapping("/code/{registrationCode}")
    public ResponseEntity<ApiResponse<RegistrationResponse>> getByRegistrationCode(
            @PathVariable String registrationCode) {
        return ResponseEntity.ok(ApiResponse.success(registrationService.getPublicRegistrationByCode(registrationCode)));
    }
}
