package com.kanteelite.training.service;

import com.kanteelite.training.dto.response.StandingEntryResponse;
import com.kanteelite.training.entity.Team;
import com.kanteelite.training.entity.Tournament;
import com.kanteelite.training.entity.TournamentMatch;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.TeamPlayerRepository;
import com.kanteelite.training.repository.TeamRegistrationRepository;
import com.kanteelite.training.repository.TeamRepository;
import com.kanteelite.training.repository.TournamentMatchRepository;
import com.kanteelite.training.repository.TournamentRepository;
import com.kanteelite.training.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TournamentServiceTest {

    @Mock private TournamentRepository tournamentRepository;
    @Mock private TeamRepository teamRepository;
    @Mock private TeamRegistrationRepository teamRegistrationRepository;
    @Mock private TeamPlayerRepository teamPlayerRepository;
    @Mock private TournamentMatchRepository tournamentMatchRepository;
    @Mock private UserRepository userRepository;
    @Mock private EmailService emailService;
    @Mock private AuditLogService auditLogService;
    @Mock private TournamentRegistrationFileStorageService fileStorageService;

    @InjectMocks
    private TournamentService tournamentService;

    private Tournament tournament;
    private Team teamA;
    private Team teamB;
    private Team teamC;

    @BeforeEach
    void setUp() {
        tournament = Tournament.builder()
                .id(1L)
                .name("Spring Cup")
                .location("Test Arena")
                .startDate(LocalDate.now())
                .maxTeams(8)
                .pointsForWin(3)
                .pointsForDraw(1)
                .pointsForLoss(0)
                .build();

        teamA = new Team();
        teamA.setId(10L);
        teamA.setName("Team A");

        teamB = new Team();
        teamB.setId(20L);
        teamB.setName("Team B");

        teamC = new Team();
        teamC.setId(30L);
        teamC.setName("Team C");
    }

    // ── computeStandings ─────────────────────────────────────────────────────

    @Test
    void computeStandings_returnsEmptyListWhenNoFinalMatches() {
        when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
        when(tournamentMatchRepository
                .findByTournamentIdOrderByMatchDateAscKickoffTimeAscIdAsc(1L))
                .thenReturn(List.of());

        List<StandingEntryResponse> standings = tournamentService.computeStandings(1L);

        assertThat(standings).isEmpty();
    }

    @Test
    void computeStandings_correctlySortsTeamsByPoints() {
        TournamentMatch winMatch = buildFinalMatch(1L, "Group A", teamA, teamB, 2, 0);
        TournamentMatch drawMatch = buildFinalMatch(2L, "Group A", teamA, teamC, 1, 1);
        TournamentMatch lossMatch = buildFinalMatch(3L, "Group A", teamB, teamC, 0, 1);

        when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
        when(tournamentMatchRepository
                .findByTournamentIdOrderByMatchDateAscKickoffTimeAscIdAsc(1L))
                .thenReturn(List.of(winMatch, drawMatch, lossMatch));

        List<StandingEntryResponse> standings = tournamentService.computeStandings(1L);

        // Team A: 1W + 1D = 4pts (GD +2), Team C: 1W + 1D = 4pts (GD 0), Team B: 2L = 0pts
        assertThat(standings).hasSize(3);
        assertThat(standings.get(0).getTeamName()).isEqualTo("Team A");
        assertThat(standings.get(0).getPoints()).isEqualTo(4);
        assertThat(standings.get(0).getPosition()).isEqualTo(1);

        assertThat(standings.get(1).getTeamName()).isEqualTo("Team C");
        assertThat(standings.get(1).getPoints()).isEqualTo(4);

        assertThat(standings.get(2).getTeamName()).isEqualTo("Team B");
        assertThat(standings.get(2).getPoints()).isEqualTo(0);
    }

    @Test
    void computeStandings_onlyCountsFinalStatusMatches() {
        // A scheduled match (not FINAL) must not affect standings
        TournamentMatch scheduledMatch = buildMatch(99L, "Group A", teamA, teamB, null, null, "SCHEDULED");

        when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
        when(tournamentMatchRepository
                .findByTournamentIdOrderByMatchDateAscKickoffTimeAscIdAsc(1L))
                .thenReturn(List.of(scheduledMatch));

        List<StandingEntryResponse> standings = tournamentService.computeStandings(1L);

        assertThat(standings).isEmpty();
    }

    @Test
    void computeStandings_throwsWhenTournamentNotFound() {
        when(tournamentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tournamentService.computeStandings(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── getAllTournaments ─────────────────────────────────────────────────────

    @Test
    void getAllTournaments_returnsEmptyListWhenNoneExist() {
        when(tournamentRepository.findAllByOrderByStartDateAsc()).thenReturn(List.of());

        assertThat(tournamentService.getAllTournaments()).isEmpty();
    }

    @Test
    void getAllTournaments_returnsMappedResponses() {
        when(tournamentRepository.findAllByOrderByStartDateAsc()).thenReturn(List.of(tournament));

        var result = tournamentService.getAllTournaments();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Spring Cup");
    }

    // ── getById ──────────────────────────────────────────────────────────────

    @Test
    void getById_throwsWhenNotFound() {
        when(tournamentRepository.findById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tournamentService.getById(42L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private TournamentMatch buildFinalMatch(Long id, String stage,
            Team home, Team away, int homeScore, int awayScore) {
        return buildMatch(id, stage, home, away, homeScore, awayScore, "FINAL");
    }

    private TournamentMatch buildMatch(Long id, String stage,
            Team home, Team away, Integer homeScore, Integer awayScore, String status) {
        TournamentMatch m = new TournamentMatch();
        m.setId(id);
        m.setStageName(stage);
        m.setHomeTeam(home);
        m.setAwayTeam(away);
        m.setHomeScore(homeScore);
        m.setAwayScore(awayScore);
        m.setStatus(status);
        return m;
    }
}
