package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
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
    private LocalDateTime createdAt;
}
