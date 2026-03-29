package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardResponse {
    private long totalBookings;
    private long confirmedBookings;
    private long pendingBookings;
    private long cancelledBookings;
    private long totalPrograms;
    private long activePrograms;
    private long totalEvents;
    private long totalTournaments;
    private long totalUsers;
    private long unreadMessages;
}
