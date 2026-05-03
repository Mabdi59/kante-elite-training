package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class SessionSeriesPreviewItem {
    private LocalDate date;
    private String dayOfWeek;
    private String startTime;
    private String coachName;
    private String programName;
    private boolean conflict;
    private String conflictReason;
}
