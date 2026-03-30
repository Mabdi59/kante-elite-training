package com.kanteelite.training.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TournamentResponse {
    private Long id;
    private String name;
    private String location;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer maxTeams;
    private String description;
    private String status;
    private long registeredTeams;
    private String ageGroup;
    private LocalDate registrationDeadline;
    private String division;
    private BigDecimal entryFee;
    private String notes;
    private String formatType;
    private Integer teamsPerGroup;
    private Integer advancePerGroup;
    private Integer pointsForWin;
    private Integer pointsForDraw;
    private Integer pointsForLoss;
    private Integer matchDurationMinutes;
    private Boolean thirdPlaceMatchEnabled;
    private LocalDateTime createdAt;
}
