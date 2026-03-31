package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProgramWorkflowResponse {
    private ProgramResponse program;
    private List<ManagedParticipantResponse> participants;
    private long participantCount;
    private boolean capacityReached;
}
