package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TournamentRequest {

    @NotBlank
    @Size(max = 150)
    private String name;

    @NotBlank
    @Size(max = 200)
    private String location;

    @NotNull
    private LocalDate startDate;

    private LocalDate endDate;

    @NotNull
    private Integer maxTeams;

    private String description;

    private String status;

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
}
