package com.kanteelite.training.dto.request;

import com.kanteelite.training.enums.CalendarEventType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CalendarEventRequest {
    private String title;
    private String description;
    private CalendarEventType eventType;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private String location;
    private String ownerEmail;
    private boolean allDay;
    private String color;
}
