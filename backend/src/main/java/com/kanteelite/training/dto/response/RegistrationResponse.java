package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RegistrationResponse {
    private Long id;
    private Long sessionId;
    private Long playerProfileId;
    private String playerName;
    private Long userId;
    private String userEmail;
    private String status;
    private String notes;
    private LocalDateTime registeredAt;
}
