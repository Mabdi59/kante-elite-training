package com.kanteelite.training.dto.response;

import com.kanteelite.training.enums.CalendarEventType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CalendarEventResponse {
    private Long id;
    private String title;
    private String description;
    private CalendarEventType eventType;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private String location;
    private String ownerEmail;
    private String entityType;
    private Long entityId;
    private boolean allDay;
    private String color;
    private LocalDateTime createdAt;
}
