package com.kanteelite.training.controller.payment;

import com.kanteelite.training.dto.response.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Always-active endpoint that reports whether Stripe payments are enabled.
 * The frontend uses this to decide between direct booking and Stripe checkout.
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentStatusController {

    @Value("${app.payments.enabled:false}")
    private boolean paymentsEnabled;

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> status() {
        return ResponseEntity.ok(ApiResponse.success(Map.of("enabled", paymentsEnabled)));
    }
}
