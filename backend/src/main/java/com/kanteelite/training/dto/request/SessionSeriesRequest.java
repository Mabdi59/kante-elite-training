package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class SessionSeriesRequest {

    @NotNull(message = "Program is required")
    private Long programId;

    private Long coachUserId;
    private List<Long> playerProfileIds;

    @Size(max = 200, message = "Title must be 200 characters or less")
    private String title;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;
    private Integer numberOfWeeks;

    @NotBlank(message = "At least one weekday is required")
    private String weekdays;

    @Size(max = 20, message = "Start time must be 20 characters or less")
    private String startTime;

    @Size(max = 20, message = "Booking time must be 20 characters or less")
    private String bookingTime;

    @Min(value = 15, message = "Duration must be at least 15 minutes")
    private Integer durationMinutes = 60;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity = 1;

    @Size(max = 200, message = "Location must be 200 characters or less")
    private String location;

    @Size(max = 500, message = "Notes must be 500 characters or less")
    private String notes;

    private boolean active = true;
}
