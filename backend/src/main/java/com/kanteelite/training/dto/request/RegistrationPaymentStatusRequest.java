package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegistrationPaymentStatusRequest {
    @NotBlank
    private String paymentStatus;
}
