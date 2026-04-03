package com.kanteelite.training.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class BookingSeriesRequest {

    private Long coachUserId;
    private Long programId;
    private List<Long> playerProfileIds;
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer numberOfWeeks;
    private String weekdays;
    private String bookingTime;
    private Integer durationMinutes = 60;
    private String notes;
}
