package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AvailabilityResponse {
    private Long programId;
    private String date;
    private List<String> bookedSlots;
    private List<String> availableSlots;
}
