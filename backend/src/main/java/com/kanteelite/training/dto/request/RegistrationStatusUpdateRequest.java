package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegistrationStatusUpdateRequest {
    @NotBlank
    private String status;
}
