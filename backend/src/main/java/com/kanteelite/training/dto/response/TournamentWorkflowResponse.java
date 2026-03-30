package com.kanteelite.training.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TournamentWorkflowResponse {
    private TournamentResponse tournament;
    private List<TournamentWorkflowTeamResponse> teams;
    private List<TournamentMatchResponse> matches;
    private List<StandingEntryResponse> standings;
    private long totalPlayers;
    private long completedMatches;
}
