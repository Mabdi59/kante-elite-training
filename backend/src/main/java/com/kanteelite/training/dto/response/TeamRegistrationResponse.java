package com.kanteelite.training.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TeamRegistrationResponse {
    private Long id;
    private Long tournamentId;
    private String tournamentName;
    private Long teamId;
    private String teamName;
    private String captainName;
    private String contactEmail;
    private String status;
    private LocalDateTime createdAt;
}
