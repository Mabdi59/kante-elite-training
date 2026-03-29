package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.TeamRegistrationRequest;
import com.kanteelite.training.dto.request.TournamentRequest;
import com.kanteelite.training.dto.response.TeamRegistrationResponse;
import com.kanteelite.training.dto.response.TournamentResponse;
import com.kanteelite.training.entity.Team;
import com.kanteelite.training.entity.TeamRegistration;
import com.kanteelite.training.entity.Tournament;
import com.kanteelite.training.enums.TeamRegistrationStatus;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.TeamRegistrationRepository;
import com.kanteelite.training.repository.TeamRepository;
import com.kanteelite.training.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final TeamRepository teamRepository;
    private final TeamRegistrationRepository teamRegistrationRepository;

    @Transactional(readOnly = true)
    public List<TournamentResponse> getAllTournaments() {
        return tournamentRepository.findAllByOrderByStartDateAsc()
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public TournamentResponse getById(Long id) {
        Tournament t = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament", id));
        return toResponse(t);
    }

    @Transactional
    public TournamentResponse create(TournamentRequest req) {
        Tournament t = Tournament.builder()
                .name(req.getName())
                .location(req.getLocation())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .maxTeams(req.getMaxTeams())
                .description(req.getDescription())
                .status(req.getStatus() != null ? req.getStatus() : "UPCOMING")
                .ageGroup(req.getAgeGroup())
                .registrationDeadline(req.getRegistrationDeadline())
                .division(req.getDivision())
                .entryFee(req.getEntryFee())
                .notes(req.getNotes())
                .build();
        return toResponse(tournamentRepository.save(t));
    }

    @Transactional
    public TournamentResponse update(Long id, TournamentRequest req) {
        Tournament t = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament", id));
        t.setName(req.getName());
        t.setLocation(req.getLocation());
        t.setStartDate(req.getStartDate());
        t.setEndDate(req.getEndDate());
        t.setMaxTeams(req.getMaxTeams());
        t.setDescription(req.getDescription());
        if (req.getStatus() != null) t.setStatus(req.getStatus());
        t.setAgeGroup(req.getAgeGroup());
        t.setRegistrationDeadline(req.getRegistrationDeadline());
        t.setDivision(req.getDivision());
        t.setEntryFee(req.getEntryFee());
        t.setNotes(req.getNotes());
        return toResponse(tournamentRepository.save(t));
    }

    @Transactional
    public void delete(Long id) {
        if (!tournamentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tournament", id);
        }
        tournamentRepository.deleteById(id);
    }

    @Transactional
    public TeamRegistrationResponse registerTeam(TeamRegistrationRequest req) {
        Tournament tournament = tournamentRepository.findById(req.getTournamentId())
                .orElseThrow(() -> new ResourceNotFoundException("Tournament", req.getTournamentId()));

        Team team = Team.builder()
                .name(req.getTeamName())
                .captainName(req.getCaptainName())
                .contactEmail(req.getContactEmail())
                .build();
        team = teamRepository.save(team);

        long registered = teamRegistrationRepository.countByTournamentId(tournament.getId());
        TeamRegistrationStatus status = registered < tournament.getMaxTeams()
                ? TeamRegistrationStatus.PENDING : TeamRegistrationStatus.WAITLISTED;

        TeamRegistration reg = TeamRegistration.builder()
                .tournament(tournament)
                .team(team)
                .status(status)
                .build();
        reg = teamRegistrationRepository.save(reg);
        return toRegResponse(reg);
    }

    @Transactional(readOnly = true)
    public List<TeamRegistrationResponse> getRegistrationsForTournament(Long tournamentId) {
        return teamRegistrationRepository.findByTournamentId(tournamentId)
                .stream().map(this::toRegResponse).toList();
    }

    @Transactional
    public TeamRegistrationResponse updateRegistrationStatus(Long regId, String status) {
        TeamRegistration reg = teamRegistrationRepository.findById(regId)
                .orElseThrow(() -> new ResourceNotFoundException("TeamRegistration", regId));
        reg.setStatus(TeamRegistrationStatus.valueOf(status));
        return toRegResponse(teamRegistrationRepository.save(reg));
    }

    private TournamentResponse toResponse(Tournament t) {
        long registered = teamRegistrationRepository.countByTournamentId(t.getId());
        return TournamentResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .location(t.getLocation())
                .startDate(t.getStartDate())
                .endDate(t.getEndDate())
                .maxTeams(t.getMaxTeams())
                .description(t.getDescription())
                .status(t.getStatus())
                .registeredTeams(registered)
                .ageGroup(t.getAgeGroup())
                .registrationDeadline(t.getRegistrationDeadline())
                .division(t.getDivision())
                .entryFee(t.getEntryFee())
                .notes(t.getNotes())
                .createdAt(t.getCreatedAt())
                .build();
    }

    private TeamRegistrationResponse toRegResponse(TeamRegistration r) {
        return TeamRegistrationResponse.builder()
                .id(r.getId())
                .tournamentId(r.getTournament().getId())
                .tournamentName(r.getTournament().getName())
                .teamId(r.getTeam().getId())
                .teamName(r.getTeam().getName())
                .captainName(r.getTeam().getCaptainName())
                .contactEmail(r.getTeam().getContactEmail())
                .status(r.getStatus().name())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
