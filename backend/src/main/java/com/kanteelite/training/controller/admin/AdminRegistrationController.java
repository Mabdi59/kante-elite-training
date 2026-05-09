package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.request.RegistrationStatusUpdateRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.RegistrationResponse;
import com.kanteelite.training.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/registrations")
@RequiredArgsConstructor
public class AdminRegistrationController {

    private final RegistrationService registrationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RegistrationResponse>>> getRegistrations() {
        return ResponseEntity.ok(ApiResponse.success(registrationService.getAllRegistrations()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<RegistrationResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody RegistrationStatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Registration updated.",
                registrationService.updateStatus(id, request.getStatus())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRegistration(@PathVariable Long id) {
        registrationService.deleteRegistration(id);
        return ResponseEntity.ok(ApiResponse.success("Registration removed.", null));
    }
}
