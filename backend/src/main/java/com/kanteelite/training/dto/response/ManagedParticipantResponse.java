package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ManagedParticipantResponse {
    private Long id;
    private Long userId;
    private Long playerProfileId;
    private String participantType;
    private String name;
    private String email;
    private LocalDateTime createdAt;
}
