package com.kanteelite.training.dto.request;

import com.kanteelite.training.enums.RegistrationPaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UnifiedRegistrationPaymentStatusRequest {
    @NotNull
    private RegistrationPaymentStatus paymentStatus;
}
