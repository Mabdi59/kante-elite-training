package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

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
}
