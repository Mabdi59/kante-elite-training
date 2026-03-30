package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class TournamentMatchRequest {

    private Long homeTeamId;

    private Long awayTeamId;

    @Size(max = 100)
    private String stageName;

    @Size(max = 100)
    private String roundName;

    private LocalDate matchDate;

    private LocalTime kickoffTime;

    @Size(max = 150)
    private String venue;

    @Size(max = 100)
    private String fieldName;

    @Size(max = 30)
    private String status;

    @Min(0)
    private Integer homeScore;

    @Min(0)
    private Integer awayScore;

    private String notes;
}
