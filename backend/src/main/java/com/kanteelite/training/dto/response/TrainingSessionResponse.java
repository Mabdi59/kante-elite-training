package com.kanteelite.training.dto.response;

import com.kanteelite.training.enums.TrainingSessionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TrainingSessionResponse {
    private Long id;
    private Long programId;
    private String programName;
    private String programSlug;
    private Long eventId;
    private String eventTitle;
    private LocalDate scheduledDate;
    private String startTime;
    private String endTime;
    private String timezone;
    private String location;
    private Long coachUserId;
    private String coachName;
    private String coachEmail;
    private String coachLabel;
    private Integer capacity;
    private long registrationCount;
    private List<RegistrationResponse> roster;
    private TrainingSessionStatus status;
    private String notes;
    private Long sessionSeriesId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
