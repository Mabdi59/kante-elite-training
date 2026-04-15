package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class BookingSeriesRequest {

    private Long coachUserId;
    private Long programId;
    private List<Long> playerProfileIds;

    @Size(max = 200, message = "Title must be 200 characters or less")
    private String title;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;
    private Integer numberOfWeeks;

    @NotBlank(message = "At least one weekday is required")
    private String weekdays;

    @NotBlank(message = "Booking time is required")
    @Size(max = 10, message = "Booking time must be 10 characters or less")
    private String bookingTime;

    private Integer durationMinutes = 60;

    @Size(max = 500, message = "Notes must be 500 characters or less")
    private String notes;
}
