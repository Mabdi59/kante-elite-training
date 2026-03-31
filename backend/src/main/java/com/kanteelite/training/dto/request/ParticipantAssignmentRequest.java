package com.kanteelite.training.dto.request;

import lombok.Data;

@Data
public class ParticipantAssignmentRequest {
    private Long userId;
    private Long playerProfileId;
    private String manualName;
    private String manualEmail;
}
