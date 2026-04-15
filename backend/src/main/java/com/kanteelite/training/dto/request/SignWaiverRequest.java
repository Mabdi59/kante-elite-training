package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignWaiverRequest {

    @NotNull(message = "Waiver template ID is required")
    private Long templateId;

    @NotBlank(message = "Signature is required")
    @Size(max = 200, message = "Signature must be 200 characters or less")
    private String signature;
}
