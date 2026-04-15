package com.kanteelite.training.dto.request;

import com.kanteelite.training.enums.CalendarEventType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CalendarEventRequest {

    @NotBlank(message = "Event title is required")
    @Size(max = 200, message = "Event title must be 200 characters or less")
    private String title;

    @Size(max = 2000, message = "Description must be 2000 characters or less")
    private String description;

    @NotNull(message = "Event type is required")
    private CalendarEventType eventType;

    @NotNull(message = "Start date/time is required")
    private LocalDateTime startAt;

    private LocalDateTime endAt;

    @Size(max = 200, message = "Location must be 200 characters or less")
    private String location;

    @Email(message = "Owner email must be a valid email address")
    @Size(max = 150, message = "Owner email must be 150 characters or less")
    private String ownerEmail;

    private boolean allDay;

    @Size(max = 20, message = "Color must be 20 characters or less")
    private String color;
}
