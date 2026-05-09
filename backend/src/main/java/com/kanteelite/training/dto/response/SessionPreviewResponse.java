package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class SessionPreviewResponse {
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
    private boolean conflict;
    private List<String> reasons;
}
