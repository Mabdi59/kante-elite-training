package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class FamilyDetailResponse {

    private Long parentId;
    private String parentName;
    private String parentEmail;
    private String parentPhone;
    private String emergencyContact;

    private List<PlayerSummary> players;
    private List<BookingSeriesResponse> activeSeries;

    private int totalBookings;
    private int upcomingBookings;
    private int completedBookings;

    private List<RecentBookingItem> recentBookings;

    @Data
    @Builder
    public static class PlayerSummary {
        private Long id;
        private String name;
        private Integer age;
        private String skillLevel;
        private String preferredPosition;
        private boolean active;
    }

    @Data
    @Builder
    public static class RecentBookingItem {
        private Long id;
        private LocalDate date;
        private String time;
        private String programName;
        private String status;
        private String playerName;
    }
}
