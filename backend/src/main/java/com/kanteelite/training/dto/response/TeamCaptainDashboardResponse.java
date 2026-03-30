package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TeamCaptainDashboardResponse {
    private long totalRegistrations;
    private long pendingRegistrations;
    private long approvedRegistrations;
    private long waitlistedRegistrations;
    private long availableTournaments;
}
