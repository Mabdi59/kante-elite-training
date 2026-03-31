package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class EventWorkflowResponse {
    private EventResponse event;
    private List<ManagedParticipantResponse> participants;
    private long participantCount;
    private boolean capacityReached;
}
