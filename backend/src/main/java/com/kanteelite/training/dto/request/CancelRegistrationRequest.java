package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CancelRegistrationRequest {
    @Size(max = 1000, message = "Cancellation reason must be 1000 characters or less")
    private String reason;
}
