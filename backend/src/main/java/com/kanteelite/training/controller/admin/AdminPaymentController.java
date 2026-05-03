package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.RegistrationResponse;
import com.kanteelite.training.service.RegistrationService;
import com.kanteelite.training.service.RefundService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Payment history and refund endpoints.
 * <p>
 * Admin-scoped endpoints live under {@code /api/admin/payments} and are protected
 * by the existing security rule {@code /api/admin/**→ADMIN}.
 * The authenticated user endpoint at {@code GET /api/payments/my} requires only
 * a valid JWT (added to SecurityConfig before the broad payments permitAll).
 */
@RestController
@RequiredArgsConstructor
public class AdminPaymentController {

    private final RefundService refundService;
    private final RegistrationService registrationService;

    /** Returns registration payment state as the primary admin payment ledger. */
    @GetMapping("/api/admin/payments")
    public ResponseEntity<ApiResponse<List<RegistrationResponse>>> getAllPayments() {
        return ResponseEntity.ok(ApiResponse.success(
                registrationService.getAllRegistrations(null, null, null, null, null, null)));
    }

    /** Returns the authenticated user's own registration payment history. */
    @GetMapping("/api/payments/my")
    public ResponseEntity<ApiResponse<List<RegistrationResponse>>> getMyPayments(
            @AuthenticationPrincipal UserDetails principal) {
        String email = principal.getUsername();
        return ResponseEntity.ok(ApiResponse.success(registrationService.getAccountRegistrations(email)));
    }

    /** Refunds a registration payment; issues a Stripe refund when a Stripe payment record exists. */
    @PostMapping("/api/admin/payments/refund-registration/{registrationId}")
    public ResponseEntity<ApiResponse<RegistrationResponse>> refundRegistration(
            @PathVariable Long registrationId,
            @AuthenticationPrincipal UserDetails principal) {
        String actor = principal != null ? principal.getUsername() : "admin";
        RegistrationResponse response = refundService.refundRegistration(registrationId, actor);
        return ResponseEntity.ok(ApiResponse.success("Registration payment refunded successfully.", response));
    }

}
