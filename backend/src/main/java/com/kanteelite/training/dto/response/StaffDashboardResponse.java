package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StaffDashboardResponse {
    private long totalBookings;
    private long todayBookings;
    private long upcomingBookings;
    private long confirmedBookings;
    private long unreadMessages;
    private long blockedSlots;
    private long pendingRegistrations;
    private long totalPlayers;
    private long totalTournaments;
}
