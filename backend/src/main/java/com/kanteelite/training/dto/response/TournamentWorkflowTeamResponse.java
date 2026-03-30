package com.kanteelite.training.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TournamentWorkflowTeamResponse {
    private Long registrationId;
    private Long tournamentId;
    private Long teamId;
    private String teamName;
    private String captainName;
    private String contactEmail;
    private String phone;
    private String clubName;
    private String registrationStatus;
    private String paymentStatus;
    private String publicAccessUrl;
    private long playerCount;
    private List<TeamPlayerResponse> players;
}
