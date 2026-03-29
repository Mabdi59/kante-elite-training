package com.kanteelite.training.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BlockedSlotResponse {
    private Long id;
    private LocalDate slotDate;
    private String slotTime;
    private String reason;
    private LocalDateTime createdAt;
}
