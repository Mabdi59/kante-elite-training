package com.kanteelite.training.controller;

import com.kanteelite.training.dto.request.CheckoutRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.service.PaymentService;
import com.stripe.exception.SignatureVerificationException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<Map<String, String>>> createCheckout(
            @Valid @RequestBody CheckoutRequest request
    ) {
        String url = paymentService.createCheckoutSession(request);
        return ResponseEntity.ok(ApiResponse.success(Map.of("url", url)));
    }

    /**
     * Stripe webhook endpoint. Receives raw body for signature verification.
     * Must NOT use @RequestBody with a DTO — raw bytes required.
     */
    @PostMapping(value = "/webhook", consumes = "application/json")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader
    ) {
        try {
            paymentService.handleWebhook(payload, sigHeader);
            return ResponseEntity.ok("ok");
        } catch (SignatureVerificationException e) {
            log.warn("Webhook signature verification failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (Exception e) {
            log.error("Webhook processing failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Webhook error");
        }
    }
}
