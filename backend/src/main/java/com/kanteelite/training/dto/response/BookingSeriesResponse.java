package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class BookingSeriesResponse {

    private Long id;
    private Long coachUserId;
    private String coachName;
    private Long programId;
    private String programName;
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;
    private String weekdays;
    private String bookingTime;
    private Integer durationMinutes;
    private String notes;
    private boolean active;
    private LocalDateTime createdAt;

    private List<PlayerSummary> players;
    private int totalSessions;
    private int completedSessions;
    private int upcomingSessions;

    @Data
    @Builder
    public static class PlayerSummary {
        private Long id;
        private String name;
        private String parentUserEmail;
    }
}
