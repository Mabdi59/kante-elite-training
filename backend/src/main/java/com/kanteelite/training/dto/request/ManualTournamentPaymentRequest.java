package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ManualTournamentPaymentRequest {

    @NotBlank
    @Size(max = 50)
    private String paymentMethod;

    @Size(max = 255)
    private String paymentReference;

    @Size(max = 1000)
    private String notes;
}
