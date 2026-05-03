package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardResponse {
    private long totalRegistrations;
    private long confirmedRegistrations;
    private long pendingWaitlistRegistrations;
    private long cancelledRegistrations;
    private long totalPrograms;
    private long activePrograms;
    private long totalEvents;
    private long totalTournaments;
    private long totalUsers;
    private long unreadMessages;
    private long totalCoaches;
    private long totalPlayers;
    private long pendingRegistrations;
    private long usersWithRoleAdmin;
    private long usersWithRoleCoach;
    private long usersWithRoleUser;
    private long totalFamilies;
    private long totalActiveSeries;
}
