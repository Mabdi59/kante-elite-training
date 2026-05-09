package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ConflictReportResponse {
    private boolean hasConflict;
    private List<String> reasons;
}
