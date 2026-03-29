package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BlockedSlotRequest {
    @NotNull
    private LocalDate slotDate;

    private String slotTime;

    private String reason;
}
