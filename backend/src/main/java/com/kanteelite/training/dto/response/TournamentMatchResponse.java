package com.kanteelite.training.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TournamentMatchResponse {
    private Long id;
    private Long tournamentId;
    private Long homeTeamId;
    private String homeTeamName;
    private Long awayTeamId;
    private String awayTeamName;
    private String stageName;
    private String roundName;
    private LocalDate matchDate;
    private LocalTime kickoffTime;
    private String venue;
    private String fieldName;
    private String status;
    private Integer homeScore;
    private Integer awayScore;
    private String notes;
    private LocalDateTime createdAt;
}
