package com.kanteelite.training.dto.request;

import com.kanteelite.training.enums.RegistrationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegistrationStatusRequest {
    @NotNull
    private RegistrationStatus status;
}
