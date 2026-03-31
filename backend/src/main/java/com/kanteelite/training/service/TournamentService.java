package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.AdminTeamRegistrationRequest;
import com.kanteelite.training.dto.request.ManualTournamentPaymentRequest;
import com.kanteelite.training.dto.request.TeamPlayerRequest;
import com.kanteelite.training.dto.request.TeamRegistrationRequest;
import com.kanteelite.training.dto.request.TournamentMatchRequest;
import com.kanteelite.training.dto.request.TournamentRequest;
import com.kanteelite.training.dto.response.TeamCaptainDashboardResponse;
import com.kanteelite.training.dto.response.TeamPlayerResponse;
import com.kanteelite.training.dto.response.TeamRegistrationResponse;
import com.kanteelite.training.dto.response.StandingEntryResponse;
import com.kanteelite.training.dto.response.TournamentMatchResponse;
import com.kanteelite.training.dto.response.TournamentRegistrationDashboardResponse;
import com.kanteelite.training.dto.response.TournamentResponse;
import com.kanteelite.training.dto.response.TournamentWorkflowResponse;
import com.kanteelite.training.dto.response.TournamentWorkflowTeamResponse;
import com.kanteelite.training.entity.Team;
import com.kanteelite.training.entity.TeamPlayer;
import com.kanteelite.training.entity.TeamRegistration;
import com.kanteelite.training.entity.Tournament;
import com.kanteelite.training.entity.TournamentMatch;
import com.kanteelite.training.entity.User;
import com.kanteelite.training.enums.PaymentStatus;
import com.kanteelite.training.enums.TeamRegistrationStatus;
import com.kanteelite.training.enums.UserRole;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.TeamPlayerRepository;
import com.kanteelite.training.repository.TeamRegistrationRepository;
import com.kanteelite.training.repository.TeamRepository;
import com.kanteelite.training.repository.TournamentMatchRepository;
import com.kanteelite.training.repository.TournamentRepository;
import com.kanteelite.training.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class TournamentService {

    private static final String MATCH_STATUS_SCHEDULED = "SCHEDULED";
    private static final String MATCH_STATUS_IN_PROGRESS = "IN_PROGRESS";
    private static final String MATCH_STATUS_FINAL = "FINAL";
    private static final String MATCH_STATUS_POSTPONED = "POSTPONED";
    private static final String MATCH_STATUS_CANCELLED = "CANCELLED";

    private final TournamentRepository tournamentRepository;
    private final TeamRepository teamRepository;
    private final TeamRegistrationRepository teamRegistrationRepository;
    private final TeamPlayerRepository teamPlayerRepository;
    private final TournamentMatchRepository tournamentMatchRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final AuditLogService auditLogService;
    private final TournamentRegistrationFileStorageService fileStorageService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.payments.enabled:false}")
    private boolean paymentsEnabled;

    @Value("${stripe.secret-key:}")
    private String stripeSecretKey;

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

    @Transactional(readOnly = true)
    public TournamentWorkflowResponse getAdminWorkflow(Long tournamentId) {
        Tournament tournament = getTournamentEntity(tournamentId);
        List<TeamRegistration> registrations = teamRegistrationRepository.findByTournamentId(tournamentId);
        Map<Long, List<TeamPlayerResponse>> playersByTeamId = loadPlayersByTeamId(registrations);
        List<TournamentWorkflowTeamResponse> teams = registrations.stream()
                .sorted(Comparator.comparing(registration -> registration.getTeam().getName(), String.CASE_INSENSITIVE_ORDER))
                .map(registration -> {
                    List<TeamPlayerResponse> players = new ArrayList<>(
                            playersByTeamId.getOrDefault(registration.getTeam().getId(), List.of()));
                    return TournamentWorkflowTeamResponse.builder()
                            .registrationId(registration.getId())
                            .tournamentId(tournamentId)
                            .teamId(registration.getTeam().getId())
                            .teamName(registration.getTeam().getName())
                            .captainName(registration.getTeam().getCaptainName())
                            .contactEmail(registration.getTeam().getContactEmail())
                            .phone(registration.getTeam().getPhone())
                            .clubName(registration.getTeam().getClubName())
                            .registrationStatus(registration.getStatus().name())
                            .paymentStatus(registration.getPaymentStatus().name())
                            .publicAccessUrl(buildPublicAccessUrl(registration.getGuestAccessToken()))
                            .playerCount(players.size())
                            .players(players)
                            .build();
                })
                .toList();
        List<TournamentMatchResponse> matches = tournamentMatchRepository
                .findByTournamentIdOrderByMatchDateAscKickoffTimeAscIdAsc(tournamentId)
                .stream()
                .map(this::toMatchResponse)
                .toList();

        return TournamentWorkflowResponse.builder()
                .tournament(toResponse(tournament))
                .teams(teams)
                .matches(matches)
                .standings(computeStandings(tournamentId))
                .totalPlayers(teams.stream().mapToLong(TournamentWorkflowTeamResponse::getPlayerCount).sum())
                .completedMatches(matches.stream().filter(match -> MATCH_STATUS_FINAL.equalsIgnoreCase(match.getStatus())).count())
                .build();
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
        applyTournamentFormat(t, req);
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
        applyTournamentFormat(t, req);
        return toResponse(tournamentRepository.save(t));
    }

    @Transactional
    public void delete(Long id) {
        Tournament tournament = getTournamentEntity(id);
        List<TeamRegistration> registrations = teamRegistrationRepository.findByTournamentId(id);
        List<Long> teamIds = registrations.stream()
                .map(registration -> registration.getTeam().getId())
                .distinct()
                .toList();

        tournamentMatchRepository.deleteByTournamentId(id);
        teamRegistrationRepository.deleteAll(registrations);

        for (Long teamId : teamIds) {
            if (teamRegistrationRepository.countByTeamId(teamId) == 0) {
                teamRepository.deleteById(teamId);
            }
        }

        tournamentRepository.delete(tournament);
    }

    @Transactional
    public TournamentResponse duplicate(Long id, boolean includeData, String actorEmail) {
        Tournament source = getTournamentEntity(id);
        Tournament duplicate = Tournament.builder()
                .name(buildDuplicateTournamentName(source.getName()))
                .location(source.getLocation())
                .startDate(source.getStartDate())
                .endDate(source.getEndDate())
                .maxTeams(source.getMaxTeams())
                .description(source.getDescription())
                .status(includeData ? source.getStatus() : "UPCOMING")
                .ageGroup(source.getAgeGroup())
                .registrationDeadline(source.getRegistrationDeadline())
                .division(source.getDivision())
                .entryFee(source.getEntryFee())
                .notes(source.getNotes())
                .formatType(source.getFormatType())
                .teamsPerGroup(source.getTeamsPerGroup())
                .advancePerGroup(source.getAdvancePerGroup())
                .pointsForWin(source.getPointsForWin())
                .pointsForDraw(source.getPointsForDraw())
                .pointsForLoss(source.getPointsForLoss())
                .matchDurationMinutes(source.getMatchDurationMinutes())
                .thirdPlaceMatchEnabled(source.getThirdPlaceMatchEnabled())
                .build();
        duplicate = tournamentRepository.save(duplicate);

        if (includeData) {
            cloneTournamentWorkflow(source, duplicate);
        }

        auditLogService.log(actorEmail, "DUPLICATE", "Tournament", duplicate.getId(),
                includeData
                        ? "Duplicated tournament with data from " + source.getName()
                        : "Duplicated tournament without data from " + source.getName());
        return toResponse(duplicate);
    }

    @Transactional
    public TeamRegistrationResponse createAdminRegistration(
            AdminTeamRegistrationRequest req,
            String actorEmail) {
        Tournament tournament = tournamentRepository.findById(req.getTournamentId())
                .orElseThrow(() -> new ResourceNotFoundException("Tournament", req.getTournamentId()));

        Team team = Team.builder()
                .name(req.getTeamName().trim())
                .captainName(req.getCaptainName().trim())
                .contactEmail(normalizeEmail(req.getContactEmail()))
                .phone(trimToNull(req.getPhone()))
                .clubName(trimToNull(req.getClubName()))
                .build();
        team = teamRepository.save(team);

        if (teamRegistrationRepository.existsByTournamentIdAndTeamId(tournament.getId(), team.getId())) {
            throw new IllegalArgumentException("This team is already registered for that tournament.");
        }

        TeamRegistration registration = TeamRegistration.builder()
                .tournament(tournament)
                .team(team)
                .status(resolveAdminRegistrationStatus(req.getStatus(), tournament, null))
                .guestAccessToken(createGuestAccessToken())
                .paymentStatus(resolveAdminPaymentStatus(req.getPaymentStatus(), tournament, null))
                .build();

        applyAdminRegistrationDetails(registration, req, tournament);
        TeamRegistration saved = teamRegistrationRepository.save(registration);
        TeamRegistrationResponse response = toRegResponse(saved);

        emailService.sendTournamentRegistrationConfirmation(response, buildNextSteps(saved));
        saved.setConfirmationEmailSentAt(LocalDateTime.now());
        saved.setLastFollowUpSentAt(LocalDateTime.now());
        saved = teamRegistrationRepository.save(saved);

        auditLogService.log(actorEmail, "CREATE", "TeamRegistration", saved.getId(),
                "Admin created tournament registration for " + saved.getTeam().getName());
        return toRegResponse(saved);
    }

    @Transactional
    public TeamRegistrationResponse registerTeam(TeamRegistrationRequest req) {
        return registerTeamInternal(req, null);
    }

    @Transactional
    public TeamRegistrationResponse registerTeamForUser(TeamRegistrationRequest req, String userEmail) {
        return registerTeamInternal(req, userEmail);
    }

    @Transactional(readOnly = true)
    public TournamentRegistrationDashboardResponse getPublicRegistrationDashboard(String guestAccessToken) {
        TeamRegistration registration = getRegistrationByAccessToken(guestAccessToken);
        return toDashboardResponse(registration);
    }

    @Transactional
    public TournamentRegistrationDashboardResponse submitRoster(
            String guestAccessToken,
            String rosterText,
            MultipartFile rosterFile) {
        TeamRegistration registration = getRegistrationByAccessToken(guestAccessToken);
        boolean hasRosterText = StringUtils.hasText(rosterText);
        boolean hasFile = rosterFile != null && !rosterFile.isEmpty();

        if (!hasRosterText && !hasFile) {
            throw new IllegalArgumentException("Add roster details or upload a file before submitting.");
        }

        if (hasFile && rosterFile.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("Roster file must be 10 MB or smaller.");
        }

        if (hasRosterText) {
            registration.setRosterText(rosterText.trim());
        }

        if (hasFile) {
            try {
                TournamentRegistrationFileStorageService.StoredFile storedFile =
                        fileStorageService.storeRosterDocument(
                                registration.getId(),
                                rosterFile,
                                registration.getRosterFilePath());
                registration.setRosterFileName(storedFile.getFileName());
                registration.setRosterFilePath(storedFile.getRelativePath());
                registration.setRosterFileType(storedFile.getContentType());
            } catch (Exception e) {
                throw new IllegalArgumentException("We could not save that roster file. Please try again.");
            }
        }

        registration.setRosterSubmittedAt(LocalDateTime.now());
        registration.setLastFollowUpSentAt(LocalDateTime.now());
        TeamRegistration saved = teamRegistrationRepository.save(registration);

        TeamRegistrationResponse response = toRegResponse(saved);
        emailService.sendTournamentRegistrationUpdate(
                response,
                "Roster Received, Kante Elite Training",
                "Roster Received",
                "We received your roster details and added them to your tournament registration.",
                buildNextSteps(saved)
        );
        auditLogService.log(saved.getTeam().getContactEmail(), "ROSTER_SUBMITTED", "TeamRegistration",
                saved.getId(), "Roster submitted for tournament registration.");
        return toDashboardResponse(saved);
    }

    @Transactional
    public TournamentRegistrationDashboardResponse submitManualPayment(
            String guestAccessToken,
            ManualTournamentPaymentRequest request) {
        TeamRegistration registration = getRegistrationByAccessToken(guestAccessToken);

        if (!isPaymentRequired(registration.getTournament())) {
            throw new IllegalArgumentException("This tournament does not require a payment.");
        }
        if (registration.getPaymentStatus() == PaymentStatus.PAID) {
            throw new IllegalArgumentException("Payment is already marked as paid for this registration.");
        }

        registration.setPaymentStatus(PaymentStatus.SUBMITTED);
        registration.setPaymentMethod(request.getPaymentMethod().trim());
        registration.setPaymentReference(trimToNull(request.getPaymentReference()));
        registration.setPaymentNotes(trimToNull(request.getNotes()));
        registration.setPaymentSubmittedAt(LocalDateTime.now());
        registration.setLastFollowUpSentAt(LocalDateTime.now());

        TeamRegistration saved = teamRegistrationRepository.save(registration);
        TeamRegistrationResponse response = toRegResponse(saved);
        emailService.sendTournamentRegistrationUpdate(
                response,
                "Payment Submission Received, Kante Elite Training",
                "Payment Submission Received",
                "We recorded your payment submission. Our team will review it and update your registration once it is confirmed.",
                buildNextSteps(saved)
        );
        auditLogService.log(saved.getTeam().getContactEmail(), "PAYMENT_SUBMITTED", "TeamRegistration",
                saved.getId(), "Manual payment submitted using method " + saved.getPaymentMethod());
        return toDashboardResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TeamRegistrationResponse> getRegistrationsForCaptain(String userEmail) {
        return teamRegistrationRepository.findByTeamOwnerUserEmailIgnoreCaseOrderByCreatedAtDesc(userEmail)
                .stream().map(this::toRegResponse).toList();
    }

    @Transactional(readOnly = true)
    public TeamCaptainDashboardResponse getCaptainDashboard(String userEmail) {
        long totalRegistrations = teamRegistrationRepository.countByTeamOwnerUserEmailIgnoreCase(userEmail);
        long pendingRegistrations =
                teamRegistrationRepository.countByTeamOwnerUserEmailIgnoreCaseAndStatus(
                        userEmail, TeamRegistrationStatus.PENDING);
        long approvedRegistrations =
                teamRegistrationRepository.countByTeamOwnerUserEmailIgnoreCaseAndStatus(
                        userEmail, TeamRegistrationStatus.APPROVED);
        long waitlistedRegistrations =
                teamRegistrationRepository.countByTeamOwnerUserEmailIgnoreCaseAndStatus(
                        userEmail, TeamRegistrationStatus.WAITLISTED);
        long availableTournaments = tournamentRepository.findAllByOrderByStartDateAsc().stream()
                .filter(tournament -> tournament.getStartDate() == null
                        || !tournament.getStartDate().isBefore(LocalDate.now()))
                .filter(tournament -> !"COMPLETED".equalsIgnoreCase(tournament.getStatus()))
                .filter(tournament -> !"CANCELLED".equalsIgnoreCase(tournament.getStatus()))
                .count();

        return TeamCaptainDashboardResponse.builder()
                .totalRegistrations(totalRegistrations)
                .pendingRegistrations(pendingRegistrations)
                .approvedRegistrations(approvedRegistrations)
                .waitlistedRegistrations(waitlistedRegistrations)
                .availableTournaments(availableTournaments)
                .build();
    }

    @Transactional
    public TeamRegistrationResponse updateCaptainRegistration(
            Long registrationId, String userEmail, TeamRegistrationRequest req) {
        TeamRegistration registration = teamRegistrationRepository
                .findByIdAndTeamOwnerUserEmailIgnoreCase(registrationId, userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("TeamRegistration", registrationId));

        Team team = registration.getTeam();
        team.setName(req.getTeamName().trim());
        team.setCaptainName(req.getCaptainName().trim());
        team.setContactEmail(normalizeEmail(req.getContactEmail()));
        team.setPhone(trimToNull(req.getPhone()));
        team.setClubName(trimToNull(req.getClubName()));
        teamRepository.save(team);

        if (!registration.getTournament().getId().equals(req.getTournamentId())) {
            Tournament tournament = tournamentRepository.findById(req.getTournamentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Tournament", req.getTournamentId()));
            ensureTournamentOpenForRegistration(tournament);
            if (teamRegistrationRepository.existsByTournamentIdAndTeamId(tournament.getId(), team.getId())) {
                throw new IllegalArgumentException("This team is already registered for that tournament.");
            }

            long registered = teamRegistrationRepository.countByTournamentId(tournament.getId());
            TeamRegistrationStatus nextStatus = registered < tournament.getMaxTeams()
                    ? TeamRegistrationStatus.PENDING
                    : TeamRegistrationStatus.WAITLISTED;

            registration.setTournament(tournament);
            registration.setStatus(nextStatus);
            resetPaymentStateForTournament(registration, tournament);
        }

        return toRegResponse(teamRegistrationRepository.save(registration));
    }

    @Transactional
    public void deleteCaptainRegistration(Long registrationId, String userEmail) {
        TeamRegistration registration = teamRegistrationRepository
                .findByIdAndTeamOwnerUserEmailIgnoreCase(registrationId, userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("TeamRegistration", registrationId));

        Long teamId = registration.getTeam().getId();
        teamRegistrationRepository.delete(registration);

        if (teamRegistrationRepository.countByTeamId(teamId) == 0) {
            teamRepository.deleteById(teamId);
        }
    }

    @Transactional
    public TeamRegistrationResponse updateAdminRegistration(
            Long registrationId,
            AdminTeamRegistrationRequest req,
            String actorEmail) {
        TeamRegistration registration = teamRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("TeamRegistration", registrationId));
        Tournament tournament = tournamentRepository.findById(req.getTournamentId())
                .orElseThrow(() -> new ResourceNotFoundException("Tournament", req.getTournamentId()));

        Team team = registration.getTeam();
        team.setName(req.getTeamName().trim());
        team.setCaptainName(req.getCaptainName().trim());
        team.setContactEmail(normalizeEmail(req.getContactEmail()));
        team.setPhone(trimToNull(req.getPhone()));
        team.setClubName(trimToNull(req.getClubName()));
        teamRepository.save(team);

        if (!registration.getTournament().getId().equals(tournament.getId())
                && teamRegistrationRepository.existsByTournamentIdAndTeamId(tournament.getId(), team.getId())) {
            throw new IllegalArgumentException("This team is already registered for that tournament.");
        }

        registration.setTournament(tournament);
        registration.setStatus(resolveAdminRegistrationStatus(req.getStatus(), tournament, registration));
        registration.setPaymentStatus(resolveAdminPaymentStatus(req.getPaymentStatus(), tournament, registration));
        applyAdminRegistrationDetails(registration, req, tournament);

        TeamRegistration saved = teamRegistrationRepository.save(registration);
        auditLogService.log(actorEmail, "UPDATE", "TeamRegistration", saved.getId(),
                "Admin updated tournament registration for " + saved.getTeam().getName());
        return toRegResponse(saved);
    }

    @Transactional
    public void deleteAdminRegistration(Long registrationId, String actorEmail) {
        TeamRegistration registration = teamRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("TeamRegistration", registrationId));

        Long teamId = registration.getTeam().getId();
        teamRegistrationRepository.delete(registration);

        if (teamRegistrationRepository.countByTeamId(teamId) == 0) {
            teamRepository.deleteById(teamId);
        }

        auditLogService.log(actorEmail, "DELETE", "TeamRegistration", registrationId,
                "Admin deleted tournament registration for " + registration.getTeam().getName());
    }

    private TeamRegistrationResponse registerTeamInternal(TeamRegistrationRequest req, String userEmail) {
        Tournament tournament = tournamentRepository.findById(req.getTournamentId())
                .orElseThrow(() -> new ResourceNotFoundException("Tournament", req.getTournamentId()));
        ensureTournamentOpenForRegistration(tournament);

        User ownerUser = null;
        if (StringUtils.hasText(userEmail)) {
            ownerUser = userRepository.findByEmail(userEmail)
                    .filter(user -> user.getRole() == UserRole.TEAM_CAPTAIN
                            || user.getRole() == UserRole.COACH
                            || user.getRole() == UserRole.ADMIN)
                    .orElse(null);
        }

        Team team = Team.builder()
                .name(req.getTeamName().trim())
                .captainName(req.getCaptainName().trim())
                .contactEmail(normalizeEmail(req.getContactEmail()))
                .phone(trimToNull(req.getPhone()))
                .clubName(trimToNull(req.getClubName()))
                .ownerUser(ownerUser)
                .build();
        team = teamRepository.save(team);

        long registered = teamRegistrationRepository.countByTournamentId(tournament.getId());
        TeamRegistrationStatus status = registered < tournament.getMaxTeams()
                ? TeamRegistrationStatus.PENDING : TeamRegistrationStatus.WAITLISTED;

        TeamRegistration reg = TeamRegistration.builder()
                .tournament(tournament)
                .team(team)
                .status(status)
                .guestAccessToken(createGuestAccessToken())
                .paymentStatus(isPaymentRequired(tournament) ? PaymentStatus.PENDING : PaymentStatus.NOT_REQUIRED)
                .build();
        reg = teamRegistrationRepository.save(reg);
        TeamRegistrationResponse response = toRegResponse(reg);
        emailService.sendTournamentRegistrationConfirmation(response, buildNextSteps(reg));
        reg.setConfirmationEmailSentAt(LocalDateTime.now());
        reg.setLastFollowUpSentAt(LocalDateTime.now());
        reg = teamRegistrationRepository.save(reg);
        auditLogService.log(team.getContactEmail(), "CREATE", "TeamRegistration", reg.getId(),
                "Tournament registration created for " + tournament.getName());
        return toRegResponse(reg);
    }

    @Transactional(readOnly = true)
    public List<TeamRegistrationResponse> getRegistrationsForTournament(Long tournamentId) {
        return teamRegistrationRepository.findByTournamentId(tournamentId)
                .stream().map(this::toRegResponse).toList();
    }

    @Transactional
    public TeamRegistrationResponse updateRegistrationStatus(Long regId, String status) {
        return updateRegistrationStatus(regId, status, null);
    }

    @Transactional
    public TeamRegistrationResponse updateRegistrationStatus(Long regId, String status, String actorEmail) {
        TeamRegistration reg = teamRegistrationRepository.findById(regId)
                .orElseThrow(() -> new ResourceNotFoundException("TeamRegistration", regId));
        TeamRegistrationStatus nextStatus = TeamRegistrationStatus.valueOf(status);
        reg.setStatus(nextStatus);
        reg.setStatusEmailSentAt(LocalDateTime.now());
        reg.setLastFollowUpSentAt(LocalDateTime.now());
        TeamRegistration saved = teamRegistrationRepository.save(reg);

        TeamRegistrationResponse response = toRegResponse(saved);
        emailService.sendTournamentRegistrationUpdate(
                response,
                buildStatusSubject(nextStatus),
                buildStatusHeading(nextStatus),
                buildStatusIntro(nextStatus),
                buildNextSteps(saved)
        );
        auditLogService.log(actorEmail, "UPDATE_STATUS", "TeamRegistration", saved.getId(),
                "Registration status updated to " + nextStatus.name());
        return response;
    }

    @Transactional
    public TeamRegistrationResponse updateRegistrationPaymentStatus(Long regId, String paymentStatus, String actorEmail) {
        TeamRegistration reg = teamRegistrationRepository.findById(regId)
                .orElseThrow(() -> new ResourceNotFoundException("TeamRegistration", regId));

        PaymentStatus nextStatus = PaymentStatus.valueOf(paymentStatus);
        reg.setPaymentStatus(nextStatus);
        if (nextStatus == PaymentStatus.PAID || nextStatus == PaymentStatus.NOT_REQUIRED) {
            reg.setPaymentPaidAt(LocalDateTime.now());
        }
        if (nextStatus == PaymentStatus.PENDING || nextStatus == PaymentStatus.FAILED) {
            reg.setPaymentPaidAt(null);
        }
        reg.setLastFollowUpSentAt(LocalDateTime.now());
        TeamRegistration saved = teamRegistrationRepository.save(reg);

        TeamRegistrationResponse response = toRegResponse(saved);
        emailService.sendTournamentRegistrationUpdate(
                response,
                buildPaymentSubject(nextStatus),
                buildPaymentHeading(nextStatus),
                buildPaymentIntro(nextStatus),
                buildNextSteps(saved)
        );
        auditLogService.log(actorEmail, "UPDATE_PAYMENT_STATUS", "TeamRegistration", saved.getId(),
                "Payment status updated to " + nextStatus.name());
        return response;
    }

    @Transactional
    public TeamPlayerResponse createTeamPlayer(
            Long tournamentId,
            Long teamId,
            TeamPlayerRequest request,
            String actorEmail) {
        Team team = getRegisteredTournamentTeam(tournamentId, teamId);
        if (Boolean.TRUE.equals(request.getCaptain())) {
            clearCaptainFlag(teamId, null);
        }

        TeamPlayer player = TeamPlayer.builder()
                .team(team)
                .fullName(request.getFullName().trim())
                .jerseyNumber(trimToNull(request.getJerseyNumber()))
                .position(trimToNull(request.getPosition()))
                .captain(Boolean.TRUE.equals(request.getCaptain()))
                .notes(trimToNull(request.getNotes()))
                .build();
        TeamPlayer saved = teamPlayerRepository.save(player);
        auditLogService.log(actorEmail, "CREATE", "TeamPlayer", saved.getId(),
                "Added player " + saved.getFullName() + " to " + team.getName());
        return toTeamPlayerResponse(saved);
    }

    @Transactional
    public TeamPlayerResponse updateTeamPlayer(
            Long tournamentId,
            Long teamId,
            Long playerId,
            TeamPlayerRequest request,
            String actorEmail) {
        getRegisteredTournamentTeam(tournamentId, teamId);
        TeamPlayer player = getTeamPlayerEntity(playerId);
        if (!player.getTeam().getId().equals(teamId)) {
            throw new IllegalArgumentException("That player does not belong to this team.");
        }

        if (Boolean.TRUE.equals(request.getCaptain())) {
            clearCaptainFlag(teamId, playerId);
        }

        player.setFullName(request.getFullName().trim());
        player.setJerseyNumber(trimToNull(request.getJerseyNumber()));
        player.setPosition(trimToNull(request.getPosition()));
        player.setCaptain(Boolean.TRUE.equals(request.getCaptain()));
        player.setNotes(trimToNull(request.getNotes()));
        TeamPlayer saved = teamPlayerRepository.save(player);
        auditLogService.log(actorEmail, "UPDATE", "TeamPlayer", saved.getId(),
                "Updated player " + saved.getFullName() + " for " + saved.getTeam().getName());
        return toTeamPlayerResponse(saved);
    }

    @Transactional
    public void deleteTeamPlayer(Long tournamentId, Long teamId, Long playerId, String actorEmail) {
        getRegisteredTournamentTeam(tournamentId, teamId);
        TeamPlayer player = getTeamPlayerEntity(playerId);
        if (!player.getTeam().getId().equals(teamId)) {
            throw new IllegalArgumentException("That player does not belong to this team.");
        }

        teamPlayerRepository.delete(player);
        auditLogService.log(actorEmail, "DELETE", "TeamPlayer", playerId,
                "Deleted player " + player.getFullName() + " from " + player.getTeam().getName());
    }

    @Transactional
    public List<TeamPlayerResponse> bulkCreateTeamPlayers(
            Long tournamentId,
            Long teamId,
            List<String> lines,
            String actorEmail) {
        Team team = getRegisteredTournamentTeam(tournamentId, teamId);
        List<TeamPlayer> created = new ArrayList<>();
        for (String raw : lines) {
            String line = raw == null ? "" : raw.strip();
            if (line.isBlank()) continue;

            String fullName;
            String jerseyNumber = null;
            String position = null;

            // Accept "Name, Jersey, Position" or "Name, Jersey" or just "Name"
            String[] parts = line.split(",", 3);
            fullName = parts[0].strip();
            if (fullName.isEmpty()) continue;
            if (parts.length > 1) jerseyNumber = trimToNull(parts[1].strip());
            if (parts.length > 2) position = trimToNull(parts[2].strip());

            TeamPlayer player = TeamPlayer.builder()
                    .team(team)
                    .fullName(fullName.length() > 150 ? truncate("fullName", fullName, 150) : fullName)
                    .jerseyNumber(jerseyNumber != null && jerseyNumber.length() > 20 ? truncate("jerseyNumber", jerseyNumber, 20) : jerseyNumber)
                    .position(position != null && position.length() > 80 ? truncate("position", position, 80) : position)
                    .captain(false)
                    .build();
            created.add(teamPlayerRepository.save(player));
        }
        auditLogService.log(actorEmail, "CREATE", "TeamPlayer", teamId,
                "Bulk added " + created.size() + " players to " + team.getName());
        return created.stream().map(this::toTeamPlayerResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<StandingEntryResponse> computeStandings(Long tournamentId) {
        Tournament tournament = getTournamentEntity(tournamentId);
        List<TournamentMatch> finalMatches = tournamentMatchRepository
                .findByTournamentIdOrderByMatchDateAscKickoffTimeAscIdAsc(tournamentId)
                .stream()
                .filter(m -> MATCH_STATUS_FINAL.equalsIgnoreCase(m.getStatus())
                        && m.getHomeScore() != null && m.getAwayScore() != null)
                .toList();

        int pointsForWin = defaultInt(tournament.getPointsForWin(), 3);
        int pointsForDraw = defaultInt(tournament.getPointsForDraw(), 1);
        int pointsForLoss = defaultInt(tournament.getPointsForLoss(), 0);

        // key = "<group>|<teamId>" → stats accumulator
        java.util.Map<String, TeamStatsAccumulator> statsMap = new java.util.LinkedHashMap<>();

        for (TournamentMatch m : finalMatches) {
            String group = m.getStageName() != null ? m.getStageName() : "All Matches";
            int hGoals = m.getHomeScore();
            int aGoals = m.getAwayScore();

            if (m.getHomeTeam() != null) {
                String key = group + "|" + m.getHomeTeam().getId();
                TeamStatsAccumulator acc = statsMap.computeIfAbsent(key,
                        ignored -> new TeamStatsAccumulator(group, m.getHomeTeam().getId(), m.getHomeTeam().getName()));
                acc.played++;
                acc.goalsFor += hGoals;
                acc.goalsAgainst += aGoals;
                if (hGoals > aGoals) { acc.won++; acc.points += pointsForWin; }
                else if (hGoals == aGoals) { acc.drawn++; acc.points += pointsForDraw; }
                else { acc.lost++; acc.points += pointsForLoss; }
            }
            if (m.getAwayTeam() != null) {
                String key = group + "|" + m.getAwayTeam().getId();
                TeamStatsAccumulator acc = statsMap.computeIfAbsent(key,
                        ignored -> new TeamStatsAccumulator(group, m.getAwayTeam().getId(), m.getAwayTeam().getName()));
                acc.played++;
                acc.goalsFor += aGoals;
                acc.goalsAgainst += hGoals;
                if (aGoals > hGoals) { acc.won++; acc.points += pointsForWin; }
                else if (aGoals == hGoals) { acc.drawn++; acc.points += pointsForDraw; }
                else { acc.lost++; acc.points += pointsForLoss; }
            }
        }

        // Group by stage name, sort within each group
        java.util.Map<String, List<StandingEntryResponse>> byGroup = new java.util.LinkedHashMap<>();
        for (TeamStatsAccumulator acc : statsMap.values()) {
            StandingEntryResponse row = StandingEntryResponse.builder()
                    .teamId(acc.teamId)
                    .teamName(acc.teamName)
                    .groupName(acc.group)
                    .played(acc.played).won(acc.won).drawn(acc.drawn).lost(acc.lost)
                    .goalsFor(acc.goalsFor).goalsAgainst(acc.goalsAgainst)
                    .goalDifference(acc.goalsFor - acc.goalsAgainst)
                    .points(acc.points)
                    .build();
            byGroup.computeIfAbsent(acc.group, g -> new ArrayList<>()).add(row);
        }

        List<StandingEntryResponse> result = new ArrayList<>();
        for (List<StandingEntryResponse> group : byGroup.values()) {
            group.sort(Comparator.comparingInt(StandingEntryResponse::getPoints).reversed()
                    .thenComparingInt(StandingEntryResponse::getGoalDifference).reversed()
                    .thenComparingInt(StandingEntryResponse::getGoalsFor).reversed()
                    .thenComparing(StandingEntryResponse::getTeamName));
            for (int i = 0; i < group.size(); i++) {
                group.get(i).setPosition(i + 1);
            }
            result.addAll(group);
        }
        return result;
    }

    @Transactional
    public TournamentMatchResponse createMatch(
            Long tournamentId,
            TournamentMatchRequest request,
            String actorEmail) {
        Tournament tournament = getTournamentEntity(tournamentId);
        TournamentMatch match = TournamentMatch.builder()
                .tournament(tournament)
                .build();
        applyMatchRequest(match, tournament, request);
        TournamentMatch saved = tournamentMatchRepository.save(match);
        auditLogService.log(actorEmail, "CREATE", "TournamentMatch", saved.getId(),
                "Created tournament match for " + tournament.getName());
        return toMatchResponse(saved);
    }

    @Transactional
    public TournamentMatchResponse updateMatch(
            Long tournamentId,
            Long matchId,
            TournamentMatchRequest request,
            String actorEmail) {
        Tournament tournament = getTournamentEntity(tournamentId);
        TournamentMatch match = getTournamentMatchEntity(matchId);
        if (!match.getTournament().getId().equals(tournamentId)) {
            throw new IllegalArgumentException("That match does not belong to this tournament.");
        }

        applyMatchRequest(match, tournament, request);
        TournamentMatch saved = tournamentMatchRepository.save(match);
        auditLogService.log(actorEmail, "UPDATE", "TournamentMatch", saved.getId(),
                "Updated tournament match for " + tournament.getName());

        if (MATCH_STATUS_FINAL.equals(saved.getStatus()) && "Knockout".equals(saved.getStageName())) {
            String advancementWarning = advanceKnockoutWinner(tournamentId, saved);
            if (advancementWarning != null) {
                TournamentMatchResponse response = toMatchResponse(saved);
                response.setWarning(advancementWarning);
                return response;
            }
        }

        return toMatchResponse(saved);
    }

    @Transactional
    public void deleteMatch(Long tournamentId, Long matchId, String actorEmail) {
        getTournamentEntity(tournamentId);
        TournamentMatch match = getTournamentMatchEntity(matchId);
        if (!match.getTournament().getId().equals(tournamentId)) {
            throw new IllegalArgumentException("That match does not belong to this tournament.");
        }

        tournamentMatchRepository.delete(match);
        auditLogService.log(actorEmail, "DELETE", "TournamentMatch", matchId,
                "Deleted tournament match from " + match.getTournament().getName());
    }

    @Transactional
    public List<TournamentMatchResponse> generateSchedule(Long tournamentId, boolean overwrite, String actorEmail) {
        Tournament tournament = getTournamentEntity(tournamentId);
        List<TournamentMatch> existingMatches =
                tournamentMatchRepository.findByTournamentIdOrderByMatchDateAscKickoffTimeAscIdAsc(tournamentId);

        if (!existingMatches.isEmpty() && !overwrite) {
            throw new IllegalArgumentException("This tournament already has matches. Delete them first or overwrite the schedule.");
        }

        if (overwrite && !existingMatches.isEmpty()) {
            tournamentMatchRepository.deleteByTournamentId(tournamentId);
        }

        List<Team> teams = teamRegistrationRepository.findByTournamentId(tournamentId).stream()
                .filter(registration -> registration.getStatus() != TeamRegistrationStatus.REJECTED)
                .map(TeamRegistration::getTeam)
                .distinct()
                .sorted(Comparator.comparing(Team::getName, String.CASE_INSENSITIVE_ORDER))
                .toList();

        if (teams.size() < 2) {
            throw new IllegalArgumentException("Add at least two teams before building a schedule.");
        }

        List<TournamentMatch> generatedMatches = switch (normalizeFormatType(tournament.getFormatType())) {
            case "GROUP_STAGE" -> generateGroupStageMatches(tournament, teams);
            case "KNOCKOUT" -> generateKnockoutMatches(tournament, teams);
            default -> generateRoundRobinMatches(tournament, teams, "Round Robin");
        };

        List<TournamentMatch> savedMatches = tournamentMatchRepository.saveAll(generatedMatches);
        auditLogService.log(actorEmail, "GENERATE", "TournamentSchedule", tournamentId,
                "Generated " + savedMatches.size() + " matches for " + tournament.getName());
        return savedMatches.stream().map(this::toMatchResponse).toList();
    }

    private void applyAdminRegistrationDetails(
            TeamRegistration registration,
            AdminTeamRegistrationRequest req,
            Tournament tournament) {
        registration.setPaymentMethod(trimToNull(req.getPaymentMethod()));
        registration.setPaymentReference(trimToNull(req.getPaymentReference()));
        registration.setPaymentNotes(trimToNull(req.getPaymentNotes()));
        registration.setRosterText(trimToNull(req.getRosterText()));

        if (!isPaymentRequired(tournament)) {
            registration.setPaymentMethod(null);
            registration.setPaymentReference(null);
        }

        if (registration.getPaymentStatus() == PaymentStatus.SUBMITTED) {
            if (registration.getPaymentSubmittedAt() == null) {
                registration.setPaymentSubmittedAt(LocalDateTime.now());
            }
        } else {
            registration.setPaymentSubmittedAt(null);
        }

        if (registration.getPaymentStatus() == PaymentStatus.PAID
                || registration.getPaymentStatus() == PaymentStatus.NOT_REQUIRED) {
            if (registration.getPaymentPaidAt() == null) {
                registration.setPaymentPaidAt(LocalDateTime.now());
            }
        } else {
            registration.setPaymentPaidAt(null);
        }

        if (StringUtils.hasText(registration.getRosterText())) {
            if (registration.getRosterSubmittedAt() == null) {
                registration.setRosterSubmittedAt(LocalDateTime.now());
            }
        } else if (!StringUtils.hasText(registration.getRosterFilePath())) {
            registration.setRosterSubmittedAt(null);
        }

        registration.setLastFollowUpSentAt(LocalDateTime.now());
    }

    private TeamRegistrationStatus resolveAdminRegistrationStatus(
            String requestedStatus,
            Tournament tournament,
            TeamRegistration existingRegistration) {
        if (StringUtils.hasText(requestedStatus)) {
            return TeamRegistrationStatus.valueOf(requestedStatus.trim().toUpperCase(Locale.ROOT));
        }
        if (existingRegistration != null) {
            return existingRegistration.getStatus();
        }

        long registered = teamRegistrationRepository.countByTournamentId(tournament.getId());
        return registered < tournament.getMaxTeams()
                ? TeamRegistrationStatus.PENDING
                : TeamRegistrationStatus.WAITLISTED;
    }

    private PaymentStatus resolveAdminPaymentStatus(
            String requestedPaymentStatus,
            Tournament tournament,
            TeamRegistration existingRegistration) {
        if (!isPaymentRequired(tournament)) {
            return PaymentStatus.NOT_REQUIRED;
        }
        if (StringUtils.hasText(requestedPaymentStatus)) {
            return PaymentStatus.valueOf(requestedPaymentStatus.trim().toUpperCase(Locale.ROOT));
        }
        if (existingRegistration != null && existingRegistration.getPaymentStatus() != null) {
            return existingRegistration.getPaymentStatus();
        }
        return PaymentStatus.PENDING;
    }

    private void applyTournamentFormat(Tournament tournament, TournamentRequest request) {
        tournament.setFormatType(normalizeFormatType(request.getFormatType()));
        tournament.setTeamsPerGroup(normalizePositiveInteger(request.getTeamsPerGroup(), 4));
        tournament.setAdvancePerGroup(normalizePositiveInteger(request.getAdvancePerGroup(), 2));
        tournament.setPointsForWin(defaultInt(request.getPointsForWin(), 3));
        tournament.setPointsForDraw(defaultInt(request.getPointsForDraw(), 1));
        tournament.setPointsForLoss(defaultInt(request.getPointsForLoss(), 0));
        tournament.setMatchDurationMinutes(normalizePositiveInteger(request.getMatchDurationMinutes(), 50));
        tournament.setThirdPlaceMatchEnabled(Boolean.TRUE.equals(request.getThirdPlaceMatchEnabled()));
    }

    private void applyMatchRequest(TournamentMatch match, Tournament tournament, TournamentMatchRequest request) {
        Team homeTeam = resolveTournamentTeam(tournament.getId(), request.getHomeTeamId());
        Team awayTeam = resolveTournamentTeam(tournament.getId(), request.getAwayTeamId());

        if (homeTeam == null && awayTeam == null) {
            throw new IllegalArgumentException("Choose at least one team for this match.");
        }
        if (homeTeam != null && awayTeam != null && homeTeam.getId().equals(awayTeam.getId())) {
            throw new IllegalArgumentException("A team cannot play itself.");
        }
        if ((request.getHomeScore() == null) != (request.getAwayScore() == null)) {
            throw new IllegalArgumentException("Enter both scores or leave both blank.");
        }

        String status = normalizeMatchStatus(request.getStatus());
        if (MATCH_STATUS_FINAL.equals(status)
                && (request.getHomeScore() == null || request.getAwayScore() == null)) {
            throw new IllegalArgumentException("Final results require both scores.");
        }

        // Knockout matches must have a clear winner — draws are not permitted
        boolean isKnockoutStage = "Knockout".equals(trimToNull(request.getStageName()));
        if (isKnockoutStage && MATCH_STATUS_FINAL.equals(status)
                && request.getHomeScore() != null && request.getAwayScore() != null
                && request.getHomeScore().equals(request.getAwayScore())) {
            throw new IllegalArgumentException(
                    "Knockout matches cannot end in a draw. Adjust the score to show a clear winner.");
        }

        match.setTournament(tournament);
        match.setHomeTeam(homeTeam);
        match.setAwayTeam(awayTeam);
        match.setStageName(trimToNull(request.getStageName()));
        match.setRoundName(trimToNull(request.getRoundName()));
        match.setMatchDate(request.getMatchDate());
        match.setKickoffTime(request.getKickoffTime());
        match.setVenue(trimToNull(request.getVenue()));
        match.setFieldName(trimToNull(request.getFieldName()));
        match.setStatus(status);
        match.setHomeScore(request.getHomeScore());
        match.setAwayScore(request.getAwayScore());
        match.setNotes(trimToNull(request.getNotes()));
    }

    private Map<Long, List<TeamPlayerResponse>> loadPlayersByTeamId(List<TeamRegistration> registrations) {
        List<Long> teamIds = registrations.stream()
                .map(registration -> registration.getTeam().getId())
                .distinct()
                .toList();

        Map<Long, List<TeamPlayerResponse>> playersByTeamId = new LinkedHashMap<>();
        if (teamIds.isEmpty()) {
            return playersByTeamId;
        }

        List<TeamPlayer> players = new ArrayList<>(teamPlayerRepository.findByTeamIdIn(teamIds));
        players.sort(Comparator
                .comparing((TeamPlayer player) -> player.getTeam().getId())
                .thenComparing(TeamPlayer::getCaptain, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(TeamPlayer::getFullName, String.CASE_INSENSITIVE_ORDER));

        for (TeamPlayer player : players) {
            playersByTeamId.computeIfAbsent(player.getTeam().getId(), ignored -> new ArrayList<>())
                    .add(toTeamPlayerResponse(player));
        }
        return playersByTeamId;
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
                .formatType(t.getFormatType())
                .teamsPerGroup(t.getTeamsPerGroup())
                .advancePerGroup(t.getAdvancePerGroup())
                .pointsForWin(t.getPointsForWin())
                .pointsForDraw(t.getPointsForDraw())
                .pointsForLoss(t.getPointsForLoss())
                .matchDurationMinutes(t.getMatchDurationMinutes())
                .thirdPlaceMatchEnabled(t.getThirdPlaceMatchEnabled())
                .createdAt(t.getCreatedAt())
                .build();
    }

    public TeamRegistrationResponse toRegResponse(TeamRegistration r) {
        return TeamRegistrationResponse.builder()
                .id(r.getId())
                .tournamentId(r.getTournament().getId())
                .tournamentName(r.getTournament().getName())
                .tournamentLocation(r.getTournament().getLocation())
                .tournamentStartDate(r.getTournament().getStartDate())
                .tournamentStatus(r.getTournament().getStatus())
                .teamId(r.getTeam().getId())
                .teamName(r.getTeam().getName())
                .captainName(r.getTeam().getCaptainName())
                .contactEmail(r.getTeam().getContactEmail())
                .phone(r.getTeam().getPhone())
                .clubName(r.getTeam().getClubName())
                .status(r.getStatus().name())
                .paymentStatus(r.getPaymentStatus().name())
                .paymentMethod(r.getPaymentMethod())
                .paymentReference(r.getPaymentReference())
                .paymentNotes(r.getPaymentNotes())
                .entryFee(r.getTournament().getEntryFee())
                .paymentRequired(isPaymentRequired(r.getTournament()))
                .rosterSubmitted(r.getRosterSubmittedAt() != null)
                .rosterText(r.getRosterText())
                .rosterFileName(r.getRosterFileName())
                .rosterSubmittedAt(r.getRosterSubmittedAt())
                .guestAccessToken(r.getGuestAccessToken())
                .publicAccessUrl(buildPublicAccessUrl(r.getGuestAccessToken()))
                .createdAt(r.getCreatedAt())
                .build();
    }

    private TeamPlayerResponse toTeamPlayerResponse(TeamPlayer player) {
        return TeamPlayerResponse.builder()
                .id(player.getId())
                .teamId(player.getTeam().getId())
                .fullName(player.getFullName())
                .jerseyNumber(player.getJerseyNumber())
                .position(player.getPosition())
                .captain(player.getCaptain())
                .notes(player.getNotes())
                .createdAt(player.getCreatedAt())
                .build();
    }

    private TournamentMatchResponse toMatchResponse(TournamentMatch match) {
        return TournamentMatchResponse.builder()
                .id(match.getId())
                .tournamentId(match.getTournament().getId())
                .homeTeamId(match.getHomeTeam() != null ? match.getHomeTeam().getId() : null)
                .homeTeamName(match.getHomeTeam() != null ? match.getHomeTeam().getName() : null)
                .awayTeamId(match.getAwayTeam() != null ? match.getAwayTeam().getId() : null)
                .awayTeamName(match.getAwayTeam() != null ? match.getAwayTeam().getName() : null)
                .stageName(match.getStageName())
                .roundName(match.getRoundName())
                .matchDate(match.getMatchDate())
                .kickoffTime(match.getKickoffTime())
                .venue(match.getVenue())
                .fieldName(match.getFieldName())
                .status(match.getStatus())
                .homeScore(match.getHomeScore())
                .awayScore(match.getAwayScore())
                .notes(match.getNotes())
                .createdAt(match.getCreatedAt())
                .build();
    }

    public TournamentRegistrationDashboardResponse toDashboardResponse(TeamRegistration registration) {
        return TournamentRegistrationDashboardResponse.builder()
                .registration(toRegResponse(registration))
                .paymentRequired(isPaymentRequired(registration.getTournament()))
                .onlinePaymentAvailable(isOnlinePaymentAvailable())
                .entryFee(registration.getTournament().getEntryFee())
                .rosterSubmitted(registration.getRosterSubmittedAt() != null)
                .rosterText(registration.getRosterText())
                .rosterFileName(registration.getRosterFileName())
                .rosterSubmittedAt(registration.getRosterSubmittedAt())
                .lastFollowUpSentAt(registration.getLastFollowUpSentAt())
                .publicAccessUrl(buildPublicAccessUrl(registration.getGuestAccessToken()))
                .nextSteps(buildNextSteps(registration))
                .build();
    }

    private TeamRegistration getRegistrationByAccessToken(String guestAccessToken) {
        return teamRegistrationRepository.findByGuestAccessToken(guestAccessToken)
                .orElseThrow(() -> new ResourceNotFoundException("Team registration access link not found."));
    }

    private Tournament getTournamentEntity(Long tournamentId) {
        return tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament", tournamentId));
    }

    private TeamPlayer getTeamPlayerEntity(Long playerId) {
        return teamPlayerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("TeamPlayer", playerId));
    }

    private TournamentMatch getTournamentMatchEntity(Long matchId) {
        return tournamentMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("TournamentMatch", matchId));
    }

    private Team getRegisteredTournamentTeam(Long tournamentId, Long teamId) {
        TeamRegistration registration = teamRegistrationRepository.findByTournamentIdAndTeamId(tournamentId, teamId)
                .orElseThrow(() -> new IllegalArgumentException("That team is not registered for this tournament."));
        return registration.getTeam();
    }

    private Team resolveTournamentTeam(Long tournamentId, Long teamId) {
        if (teamId == null) {
            return null;
        }
        return getRegisteredTournamentTeam(tournamentId, teamId);
    }

    private void clearCaptainFlag(Long teamId, Long exceptPlayerId) {
        List<TeamPlayer> players = teamPlayerRepository.findByTeamIdOrderByCaptainDescFullNameAsc(teamId);
        for (TeamPlayer player : players) {
            if (exceptPlayerId != null && player.getId().equals(exceptPlayerId)) {
                continue;
            }
            if (Boolean.TRUE.equals(player.getCaptain())) {
                player.setCaptain(false);
            }
        }
        teamPlayerRepository.saveAll(players);
    }

    private void ensureTournamentOpenForRegistration(Tournament tournament) {
        if ("COMPLETED".equalsIgnoreCase(tournament.getStatus())
                || "CANCELLED".equalsIgnoreCase(tournament.getStatus())) {
            throw new IllegalArgumentException("This tournament is not accepting registrations.");
        }
        if (tournament.getRegistrationDeadline() != null
                && tournament.getRegistrationDeadline().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Registration for this tournament is closed.");
        }
    }

    private void resetPaymentStateForTournament(TeamRegistration registration, Tournament tournament) {
        registration.setPaymentMethod(null);
        registration.setPaymentReference(null);
        registration.setPaymentNotes(null);
        registration.setPaymentSessionId(null);
        registration.setPaymentSubmittedAt(null);
        registration.setPaymentPaidAt(null);
        registration.setPaymentReminderSentAt(null);
        registration.setLastFollowUpSentAt(null);
        registration.setPaymentStatus(isPaymentRequired(tournament) ? PaymentStatus.PENDING : PaymentStatus.NOT_REQUIRED);
    }

    private List<TournamentMatch> generateRoundRobinMatches(
            Tournament tournament,
            List<Team> teams,
            String stageName) {
        List<Team> rotation = new ArrayList<>(teams);
        if (rotation.size() % 2 != 0) {
            rotation.add(null);
        }

        ScheduleCursor cursor = ScheduleCursor.startingAt(
                tournament.getStartDate() != null ? tournament.getStartDate() : LocalDate.now(),
                normalizePositiveInteger(tournament.getMatchDurationMinutes(), 50));

        List<TournamentMatch> matches = new ArrayList<>();
        int size = rotation.size();
        int rounds = size - 1;

        for (int round = 0; round < rounds; round++) {
            for (int index = 0; index < size / 2; index++) {
                Team home = rotation.get(index);
                Team away = rotation.get(size - 1 - index);
                if (home == null || away == null) {
                    continue;
                }
                matches.add(cursor.createMatch(
                        tournament,
                        home,
                        away,
                        stageName,
                        "Round " + (round + 1)));
            }

            Team last = rotation.remove(rotation.size() - 1);
            rotation.add(1, last);
        }

        return matches;
    }

    private List<TournamentMatch> generateGroupStageMatches(Tournament tournament, List<Team> teams) {
        int teamsPerGroup = normalizePositiveInteger(tournament.getTeamsPerGroup(), 4);
        int advancePerGroup = normalizePositiveInteger(tournament.getAdvancePerGroup(), 2);
        List<TournamentMatch> matches = new ArrayList<>();
        int numGroups = 0;

        for (int index = 0; index < teams.size(); index += teamsPerGroup) {
            int endIndex = Math.min(index + teamsPerGroup, teams.size());
            List<Team> groupTeams = new ArrayList<>(teams.subList(index, endIndex));
            char groupLetter = (char) ('A' + (index / teamsPerGroup));
            matches.addAll(generateRoundRobinMatches(tournament, groupTeams, "Group " + groupLetter));
            numGroups++;
        }

        // Knockout bracket: placeholder (TBD) matches generated after group phase
        int totalAdvancing = numGroups * advancePerGroup;
        if (totalAdvancing >= 2) {
            int size = Integer.highestOneBit(totalAdvancing); // round down to nearest power of 2
            while (size >= 2) {
                String roundLabel = switch (size) {
                    case 2 -> "Final";
                    case 4 -> "Semifinal";
                    case 8 -> "Quarterfinal";
                    default -> "Round of " + size;
                };
                int matchesInRound = size / 2;
                if (matchesInRound == 1) {
                    matches.add(createKnockoutPlaceholder(tournament, "Knockout", roundLabel));
                } else {
                    for (int i = 1; i <= matchesInRound; i++) {
                        matches.add(createKnockoutPlaceholder(tournament, "Knockout", roundLabel + " " + i));
                    }
                }
                size /= 2;
            }
            if (Boolean.TRUE.equals(tournament.getThirdPlaceMatchEnabled())) {
                matches.add(createKnockoutPlaceholder(tournament, "Knockout", "Third Place"));
            }
        }

        return matches;
    }

    private TournamentMatch createKnockoutPlaceholder(Tournament tournament, String stageName, String roundName) {
        return TournamentMatch.builder()
                .tournament(tournament)
                .stageName(stageName)
                .roundName(roundName)
                .venue(tournament.getLocation())
                .status(MATCH_STATUS_SCHEDULED)
                .build();
    }

    @Transactional
    public List<TournamentMatchResponse> seedKnockoutBracket(Long tournamentId, String actorEmail) {
        Tournament tournament = getTournamentEntity(tournamentId);

        if (!"GROUP_STAGE".equals(normalizeFormatType(tournament.getFormatType()))) {
            throw new IllegalArgumentException("Bracket seeding is only available for GROUP_STAGE tournaments.");
        }

        List<TournamentMatch> allMatches = tournamentMatchRepository
                .findByTournamentIdOrderByMatchDateAscKickoffTimeAscIdAsc(tournamentId);

        List<TournamentMatch> groupMatches = allMatches.stream()
                .filter(m -> m.getStageName() != null && m.getStageName().startsWith("Group "))
                .toList();

        List<TournamentMatch> knockoutMatches = allMatches.stream()
                .filter(m -> "Knockout".equals(m.getStageName()))
                .sorted(Comparator.comparing(TournamentMatch::getId))
                .toList();

        if (knockoutMatches.isEmpty()) {
            throw new IllegalArgumentException(
                    "No knockout bracket found. Run 'Auto Build Schedule' first to generate the bracket.");
        }

        long unfinishedGroupMatches = groupMatches.stream()
                .filter(m -> !MATCH_STATUS_FINAL.equalsIgnoreCase(m.getStatus()))
                .count();
        if (unfinishedGroupMatches > 0) {
            throw new IllegalArgumentException(
                    unfinishedGroupMatches + " group stage match(es) are not yet marked FINAL. "
                    + "Complete all group matches before seeding the knockout bracket.");
        }

        // Compute standings and group by group name
        List<StandingEntryResponse> standings = computeStandings(tournamentId);
        LinkedHashMap<String, List<StandingEntryResponse>> byGroup = new LinkedHashMap<>();
        for (StandingEntryResponse s : standings) {
            if (s.getGroupName() != null && s.getGroupName().startsWith("Group ")) {
                byGroup.computeIfAbsent(s.getGroupName(), k -> new ArrayList<>()).add(s);
            }
        }

        if (byGroup.isEmpty()) {
            throw new IllegalArgumentException(
                    "No group standings found. Mark group matches as FINAL first.");
        }

        int advancePerGroup = normalizePositiveInteger(tournament.getAdvancePerGroup(), 2);

        // For each group, collect the top advancePerGroup team IDs (standings are already sorted)
        List<List<Long>> groupAdvancerIds = new ArrayList<>();
        for (List<StandingEntryResponse> groupRows : byGroup.values()) {
            List<Long> ids = groupRows.stream()
                    .limit(advancePerGroup)
                    .map(StandingEntryResponse::getTeamId)
                    .toList();
            groupAdvancerIds.add(ids);
        }

        // Build cross-seeded pairs: A1 vs B2, B1 vs A2 etc.
        List<long[]> seedPairs = buildGroupSeedPairs(groupAdvancerIds, advancePerGroup);

        if (seedPairs.isEmpty()) {
            throw new IllegalArgumentException("Could not build seeding pairs from the current group standings.");
        }
        if (seedPairs.size() > knockoutMatches.size()) {
            throw new IllegalArgumentException(
                    "Not enough knockout bracket slots (" + knockoutMatches.size()
                    + ") for " + seedPairs.size() + " seeded pairs.");
        }

        // Load Team entities for all advancing team IDs
        Set<Long> allTeamIds = new LinkedHashSet<>();
        for (long[] pair : seedPairs) {
            allTeamIds.add(pair[0]);
            allTeamIds.add(pair[1]);
        }
        Map<Long, Team> teamById = new LinkedHashMap<>();
        for (Long tid : allTeamIds) {
            teamById.put(tid, teamRepository.findById(tid)
                    .orElseThrow(() -> new ResourceNotFoundException("Team", tid)));
        }

        // Seed the first-round knockout matches (first N matches in ID order)
        List<TournamentMatch> updated = new ArrayList<>();
        for (int i = 0; i < seedPairs.size(); i++) {
            TournamentMatch match = knockoutMatches.get(i);
            match.setHomeTeam(teamById.get(seedPairs.get(i)[0]));
            match.setAwayTeam(teamById.get(seedPairs.get(i)[1]));
            updated.add(tournamentMatchRepository.save(match));
        }

        auditLogService.log(actorEmail, "SEED", "KnockoutBracket", tournamentId,
                "Seeded knockout bracket for " + tournament.getName()
                + " with " + seedPairs.size() + " first-round match(es).");

        return updated.stream().map(this::toMatchResponse).toList();
    }

    /**
     * Builds cross-seeded pairs from a list of per-group advancer ID lists.
     * For two groups [A1,A2] and [B1,B2] with advancePerGroup=2 this produces:
     *   (A1, B2), (B1, A2)
     * For four groups with advancePerGroup=2 this produces:
     *   (A1, B2), (B1, A2), (C1, D2), (D1, C2)
     */
    private List<long[]> buildGroupSeedPairs(List<List<Long>> groups, int advancePerGroup) {
        List<long[]> pairs = new ArrayList<>();

        // Process groups in pairs for cross-seeding
        for (int gi = 0; gi + 1 < groups.size(); gi += 2) {
            List<Long> g1 = groups.get(gi);
            List<Long> g2 = groups.get(gi + 1);
            int n = Math.min(advancePerGroup, Math.min(g1.size(), g2.size()));

            // Interleave: (g1[0] vs g2[n-1]), (g2[0] vs g1[n-1]), (g1[1] vs g2[n-2]), (g2[1] vs g1[n-2]), ...
            for (int pos = 0; pos < n; pos++) {
                if (pos % 2 == 0) {
                    pairs.add(new long[]{g1.get(pos / 2), g2.get(n - 1 - pos / 2)});
                } else {
                    pairs.add(new long[]{g2.get(pos / 2), g1.get(n - 1 - pos / 2)});
                }
            }
        }

        // Handle an odd unpaired group — seed within itself
        if (groups.size() % 2 != 0) {
            List<Long> lastGroup = groups.get(groups.size() - 1);
            for (int i = 0; i + 1 < lastGroup.size(); i += 2) {
                pairs.add(new long[]{lastGroup.get(i), lastGroup.get(i + 1)});
            }
        }

        return pairs;
    }

    /**
     * When a knockout match is marked FINAL, slot the winner into the next-round match
     * and (for the penultimate round) slot the loser into the Third Place match.
     * Round names follow the pattern generated by the scheduler:
     *   "Quarterfinal 1", "Quarterfinal 2", "Semifinal 1", "Final", "Third Place"
     * The position within a round drives home/away slot assignment.
     *
     * @return a warning message if advancement was blocked because a slot was already occupied, or null if all went well.
     */
    private String advanceKnockoutWinner(Long tournamentId, TournamentMatch finishedMatch) {
        // Third Place and Final have nowhere to advance
        String finishedRound = finishedMatch.getRoundName();
        if ("Third Place".equalsIgnoreCase(finishedRound) || "Final".equalsIgnoreCase(finishedRound)) {
            return null;
        }


        // Determine winner and loser
        Team winner = null;
        Team loser = null;
        if (finishedMatch.getHomeScore() != null && finishedMatch.getAwayScore() != null) {
            if (finishedMatch.getHomeScore() > finishedMatch.getAwayScore()) {
                winner = finishedMatch.getHomeTeam();
                loser = finishedMatch.getAwayTeam();
            } else if (finishedMatch.getAwayScore() > finishedMatch.getHomeScore()) {
                winner = finishedMatch.getAwayTeam();
                loser = finishedMatch.getHomeTeam();
            }
        }
        if (winner == null) {
            return null; // draw — no definitive winner, cannot advance
        }

        // Load all knockout matches (excluding Third Place) ordered by creation ID
        List<TournamentMatch> allKnockout = tournamentMatchRepository
                .findByTournamentIdOrderByMatchDateAscKickoffTimeAscIdAsc(tournamentId)
                .stream()
                .filter(m -> "Knockout".equals(m.getStageName())
                        && !"Third Place".equalsIgnoreCase(m.getRoundName()))
                .sorted(Comparator.comparing(TournamentMatch::getId))
                .collect(Collectors.toList());

        // Group by base round name; LinkedHashMap preserves insertion order (earliest ID first)
        LinkedHashMap<String, List<TournamentMatch>> roundMap = new LinkedHashMap<>();
        for (TournamentMatch m : allKnockout) {
            roundMap.computeIfAbsent(parseBaseRoundName(m.getRoundName()), k -> new ArrayList<>()).add(m);
        }

        List<String> roundOrder = new ArrayList<>(roundMap.keySet());
        String currentBase = parseBaseRoundName(finishedRound);
        int currentIdx = roundOrder.indexOf(currentBase);
        if (currentIdx == -1 || currentIdx >= roundOrder.size() - 1) {
            return null; // already in the final round of the winner bracket
        }

        int matchPos = parseRoundPosition(finishedRound); // 1-based position within the round
        boolean isHomeSlot = matchPos % 2 == 1;
        int nextPos = (matchPos + 1) / 2; // 1-based position in the next round

        String advancementWarning = null;

        // Advance winner into next round — warn the admin if the slot is already occupied
        String nextBase = roundOrder.get(currentIdx + 1);
        List<TournamentMatch> nextRoundMatches = roundMap.get(nextBase);
        if (nextRoundMatches != null && nextPos >= 1 && nextPos <= nextRoundMatches.size()) {
            TournamentMatch target = nextRoundMatches.get(nextPos - 1);
            boolean slotAlreadyFilled = isHomeSlot
                    ? target.getHomeTeam() != null
                    : target.getAwayTeam() != null;
            if (slotAlreadyFilled) {
                advancementWarning = "The next-round slot in " + nextBase + " already has a team assigned. "
                        + "The bracket may be in an inconsistent state — review the " + nextBase + " match manually.";
            } else {
                if (isHomeSlot) {
                    target.setHomeTeam(winner);
                } else {
                    target.setAwayTeam(winner);
                }
                tournamentMatchRepository.save(target);
            }
        }

        // If this is the penultimate winner-bracket round (one before Final), advance loser to Third Place
        boolean isPenultimateRound = currentIdx == roundOrder.size() - 2;
        if (isPenultimateRound && loser != null) {
            final Team finalLoser = loser;
            final boolean finalIsHomeSlot = isHomeSlot;
            final String[] tpWarning = {null};
            tournamentMatchRepository
                    .findByTournamentIdOrderByMatchDateAscKickoffTimeAscIdAsc(tournamentId)
                    .stream()
                    .filter(m -> "Knockout".equals(m.getStageName())
                            && "Third Place".equalsIgnoreCase(m.getRoundName()))
                    .findFirst()
                    .ifPresent(thirdPlace -> {
                        boolean tpSlotFilled = finalIsHomeSlot
                                ? thirdPlace.getHomeTeam() != null
                                : thirdPlace.getAwayTeam() != null;
                        if (tpSlotFilled) {
                            tpWarning[0] = "The Third Place match slot already has a team assigned. "
                                    + "Review the Third Place match manually.";
                        } else {
                            if (finalIsHomeSlot) {
                                thirdPlace.setHomeTeam(finalLoser);
                            } else {
                                thirdPlace.setAwayTeam(finalLoser);
                            }
                            tournamentMatchRepository.save(thirdPlace);
                        }
                    });
            if (tpWarning[0] != null) {
                advancementWarning = advancementWarning != null
                        ? advancementWarning + " Also: " + tpWarning[0]
                        : tpWarning[0];
            }
        }

        return advancementWarning;
    }

    /** Returns the base name of a round, stripping a trailing integer. */
    private String parseBaseRoundName(String roundName) {
        if (roundName == null) return "Unknown";
        String trimmed = roundName.trim();
        int lastSpace = trimmed.lastIndexOf(' ');
        if (lastSpace > 0) {
            String lastPart = trimmed.substring(lastSpace + 1);
            try {
                Integer.parseInt(lastPart);
                return trimmed.substring(0, lastSpace).trim();
            } catch (NumberFormatException e) {
                // fall through
            }
        }
        return trimmed;
    }

    /** Returns the 1-based position within a round ("Semifinal 2" → 2, "Final" → 1). */
    private int parseRoundPosition(String roundName) {
        if (roundName == null) return 1;
        String trimmed = roundName.trim();
        int lastSpace = trimmed.lastIndexOf(' ');
        if (lastSpace > 0) {
            String lastPart = trimmed.substring(lastSpace + 1);
            try {
                return Integer.parseInt(lastPart);
            } catch (NumberFormatException e) {
                // fall through
            }
        }
        return 1;
    }

    private List<TournamentMatch> generateKnockoutMatches(Tournament tournament, List<Team> teams) {
        if (teams.size() % 2 != 0) {
            throw new IllegalArgumentException("Knockout auto build needs an even number of teams.");
        }

        ScheduleCursor cursor = ScheduleCursor.startingAt(
                tournament.getStartDate() != null ? tournament.getStartDate() : LocalDate.now(),
                normalizePositiveInteger(tournament.getMatchDurationMinutes(), 50));

        String roundName = switch (teams.size()) {
            case 2 -> "Final";
            case 4 -> "Semifinal";
            case 8 -> "Quarterfinal";
            default -> "Knockout Round";
        };

        List<TournamentMatch> matches = new ArrayList<>();
        for (int index = 0; index < teams.size(); index += 2) {
            matches.add(cursor.createMatch(
                    tournament,
                    teams.get(index),
                    teams.get(index + 1),
                    "Knockout",
                    roundName + " " + ((index / 2) + 1)));
        }
        return matches;
    }

    private void cloneTournamentWorkflow(Tournament source, Tournament duplicate) {
        List<TeamRegistration> sourceRegistrations = teamRegistrationRepository.findByTournamentId(source.getId());
        Map<Long, Team> duplicatedTeams = new LinkedHashMap<>();

        for (TeamRegistration sourceRegistration : sourceRegistrations) {
            Team sourceTeam = sourceRegistration.getTeam();
            Team duplicatedTeam = Team.builder()
                    .name(sourceTeam.getName())
                    .captainName(sourceTeam.getCaptainName())
                    .contactEmail(sourceTeam.getContactEmail())
                    .phone(sourceTeam.getPhone())
                    .clubName(sourceTeam.getClubName())
                    .ownerUser(sourceTeam.getOwnerUser())
                    .build();
            duplicatedTeam = teamRepository.save(duplicatedTeam);
            duplicatedTeams.put(sourceTeam.getId(), duplicatedTeam);

            cloneTeamPlayers(sourceTeam.getId(), duplicatedTeam);
            cloneRegistration(sourceRegistration, duplicate, duplicatedTeam);
        }

        List<TournamentMatch> sourceMatches =
                tournamentMatchRepository.findByTournamentIdOrderByMatchDateAscKickoffTimeAscIdAsc(source.getId());
        for (TournamentMatch sourceMatch : sourceMatches) {
            TournamentMatch duplicatedMatch = TournamentMatch.builder()
                    .tournament(duplicate)
                    .homeTeam(sourceMatch.getHomeTeam() != null ? duplicatedTeams.get(sourceMatch.getHomeTeam().getId()) : null)
                    .awayTeam(sourceMatch.getAwayTeam() != null ? duplicatedTeams.get(sourceMatch.getAwayTeam().getId()) : null)
                    .stageName(sourceMatch.getStageName())
                    .roundName(sourceMatch.getRoundName())
                    .matchDate(sourceMatch.getMatchDate())
                    .kickoffTime(sourceMatch.getKickoffTime())
                    .venue(sourceMatch.getVenue())
                    .fieldName(sourceMatch.getFieldName())
                    .status(sourceMatch.getStatus())
                    .homeScore(sourceMatch.getHomeScore())
                    .awayScore(sourceMatch.getAwayScore())
                    .notes(sourceMatch.getNotes())
                    .build();
            tournamentMatchRepository.save(duplicatedMatch);
        }
    }

    private void cloneTeamPlayers(Long sourceTeamId, Team duplicatedTeam) {
        List<TeamPlayer> sourcePlayers = teamPlayerRepository.findByTeamIdOrderByCaptainDescFullNameAsc(sourceTeamId);
        for (TeamPlayer sourcePlayer : sourcePlayers) {
            TeamPlayer duplicatedPlayer = TeamPlayer.builder()
                    .team(duplicatedTeam)
                    .fullName(sourcePlayer.getFullName())
                    .jerseyNumber(sourcePlayer.getJerseyNumber())
                    .position(sourcePlayer.getPosition())
                    .captain(sourcePlayer.getCaptain())
                    .notes(sourcePlayer.getNotes())
                    .build();
            teamPlayerRepository.save(duplicatedPlayer);
        }
    }

    private void cloneRegistration(TeamRegistration sourceRegistration, Tournament duplicate, Team duplicatedTeam) {
        LocalDateTime now = LocalDateTime.now();
        TeamRegistration duplicatedRegistration = TeamRegistration.builder()
                .tournament(duplicate)
                .team(duplicatedTeam)
                .status(sourceRegistration.getStatus())
                .guestAccessToken(createGuestAccessToken())
                .paymentStatus(sourceRegistration.getPaymentStatus())
                .build();

        duplicatedRegistration.setPaymentMethod(sourceRegistration.getPaymentMethod());
        duplicatedRegistration.setPaymentReference(sourceRegistration.getPaymentReference());
        duplicatedRegistration.setPaymentNotes(sourceRegistration.getPaymentNotes());
        duplicatedRegistration.setPaymentSessionId(null);
        duplicatedRegistration.setPaymentSubmittedAt(sourceRegistration.getPaymentSubmittedAt());
        duplicatedRegistration.setPaymentPaidAt(sourceRegistration.getPaymentPaidAt());
        duplicatedRegistration.setConfirmationEmailSentAt(now);
        duplicatedRegistration.setStatusEmailSentAt(sourceRegistration.getStatusEmailSentAt());
        duplicatedRegistration.setPaymentReminderSentAt(
                sourceRegistration.getPaymentReminderSentAt() != null ? sourceRegistration.getPaymentReminderSentAt() : now);
        duplicatedRegistration.setRosterReminderSentAt(
                sourceRegistration.getRosterReminderSentAt() != null ? sourceRegistration.getRosterReminderSentAt() : now);
        duplicatedRegistration.setLastFollowUpSentAt(now);
        duplicatedRegistration.setRosterText(sourceRegistration.getRosterText());
        duplicatedRegistration.setRosterFileName(sourceRegistration.getRosterFileName());
        duplicatedRegistration.setRosterFilePath(sourceRegistration.getRosterFilePath());
        duplicatedRegistration.setRosterFileType(sourceRegistration.getRosterFileType());
        duplicatedRegistration.setRosterSubmittedAt(sourceRegistration.getRosterSubmittedAt());
        teamRegistrationRepository.save(duplicatedRegistration);
    }

    private List<String> buildNextSteps(TeamRegistration registration) {
        List<String> nextSteps = new ArrayList<>();
        nextSteps.add("Open your Team Portal anytime to review your registration status.");

        if (registration.getStatus() == TeamRegistrationStatus.WAITLISTED) {
            nextSteps.add("Your team is on the waitlist right now. We will email you if a spot opens.");
        } else if (registration.getStatus() == TeamRegistrationStatus.APPROVED) {
            nextSteps.add("Your team is approved. Finish any remaining items below so you are ready for the event.");
        } else if (registration.getStatus() == TeamRegistrationStatus.REJECTED) {
            nextSteps.add("This registration has been declined. Contact us if you need help.");
        } else {
            nextSteps.add("Your registration is under review. We will send updates as soon as the next step is ready.");
        }

        if (isPaymentRequired(registration.getTournament())) {
            if (registration.getPaymentStatus() == PaymentStatus.PAID) {
                nextSteps.add("Your tournament entry fee is marked as paid.");
            } else if (registration.getPaymentStatus() == PaymentStatus.SUBMITTED) {
                nextSteps.add("We received your payment submission and will confirm it shortly.");
            } else {
                nextSteps.add("Complete the payment step from your Team Portal to finish your entry.");
            }
        }

        if (registration.getRosterSubmittedAt() != null) {
            nextSteps.add("Your roster is on file. You can upload an updated version from your Team Portal if needed.");
        } else {
            nextSteps.add("Submit your roster details or upload a roster document from your Team Portal.");
        }

        if (StringUtils.hasText(registration.getTournament().getNotes())) {
            nextSteps.add(registration.getTournament().getNotes().trim());
        }

        return nextSteps;
    }

    private boolean isPaymentRequired(Tournament tournament) {
        BigDecimal entryFee = tournament.getEntryFee();
        return entryFee != null && entryFee.compareTo(BigDecimal.ZERO) > 0;
    }

    private boolean isOnlinePaymentAvailable() {
        return paymentsEnabled && StringUtils.hasText(stripeSecretKey);
    }

    private String buildPublicAccessUrl(String guestAccessToken) {
        return frontendUrl + "/tournaments/registration/" + guestAccessToken;
    }

    private String createGuestAccessToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String truncate(String fieldName, String value, int maxLength) {
        log.warn("Bulk import: {} value truncated from {} to {} characters", fieldName, value.length(), maxLength);
        return value.substring(0, maxLength);
    }

    private String buildDuplicateTournamentName(String originalName) {
        String baseName = StringUtils.hasText(originalName) ? originalName.trim() : "Tournament";
        List<String> existingNames = tournamentRepository.findAll().stream()
                .map(Tournament::getName)
                .filter(StringUtils::hasText)
                .map(name -> name.trim().toLowerCase(Locale.ROOT))
                .toList();

        String candidate = baseName + " Copy";
        int counter = 2;
        while (existingNames.contains(candidate.toLowerCase(Locale.ROOT))) {
            candidate = baseName + " Copy " + counter;
            counter++;
        }
        return candidate;
    }

    private String normalizeFormatType(String value) {
        if (!StringUtils.hasText(value)) {
            return "ROUND_ROBIN";
        }
        String normalized = value.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "GROUP_STAGE", "KNOCKOUT" -> normalized;
            default -> "ROUND_ROBIN";
        };
    }

    private String normalizeMatchStatus(String value) {
        if (!StringUtils.hasText(value)) {
            return MATCH_STATUS_SCHEDULED;
        }
        String normalized = value.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case MATCH_STATUS_IN_PROGRESS, MATCH_STATUS_FINAL, MATCH_STATUS_POSTPONED, MATCH_STATUS_CANCELLED -> normalized;
            default -> MATCH_STATUS_SCHEDULED;
        };
    }

    private int defaultInt(Integer value, int fallback) {
        return value != null ? value : fallback;
    }

    private int normalizePositiveInteger(Integer value, int fallback) {
        return value != null && value > 0 ? value : fallback;
    }

    private String buildStatusSubject(TeamRegistrationStatus status) {
        return switch (status) {
            case APPROVED -> "Tournament Registration Approved, Kante Elite Training";
            case WAITLISTED -> "Tournament Registration Waitlisted, Kante Elite Training";
            case REJECTED -> "Tournament Registration Update, Kante Elite Training";
            default -> "Tournament Registration Updated, Kante Elite Training";
        };
    }

    private String buildStatusHeading(TeamRegistrationStatus status) {
        return switch (status) {
            case APPROVED -> "Registration Approved";
            case WAITLISTED -> "Waitlist Update";
            case REJECTED -> "Registration Update";
            default -> "Registration Updated";
        };
    }

    private String buildStatusIntro(TeamRegistrationStatus status) {
        return switch (status) {
            case APPROVED -> "Your team registration has been approved. Please review your Team Portal for any remaining payment or roster tasks.";
            case WAITLISTED -> "Your team is currently on the waitlist. We will contact you if a spot opens.";
            case REJECTED -> "We updated your tournament registration. Please review your Team Portal and contact us if you need help.";
            default -> "Your tournament registration status has been updated. Check your Team Portal for the latest details.";
        };
    }

    private String buildPaymentSubject(PaymentStatus status) {
        return switch (status) {
            case PAID -> "Tournament Payment Confirmed, Kante Elite Training";
            case FAILED -> "Tournament Payment Update, Kante Elite Training";
            case REFUNDED -> "Tournament Payment Refunded, Kante Elite Training";
            case SUBMITTED -> "Tournament Payment Submission Received, Kante Elite Training";
            case NOT_REQUIRED -> "Tournament Payment Not Required, Kante Elite Training";
            default -> "Tournament Payment Updated, Kante Elite Training";
        };
    }

    private String buildPaymentHeading(PaymentStatus status) {
        return switch (status) {
            case PAID -> "Payment Confirmed";
            case FAILED -> "Payment Update";
            case REFUNDED -> "Payment Refunded";
            case SUBMITTED -> "Payment Submitted";
            case NOT_REQUIRED -> "No Payment Required";
            default -> "Payment Updated";
        };
    }

    private String buildPaymentIntro(PaymentStatus status) {
        return switch (status) {
            case PAID -> "Your tournament payment is confirmed. Your Team Portal now shows this registration as paid.";
            case FAILED -> "There was a problem confirming your payment. Please return to your Team Portal and try again or contact us for help.";
            case REFUNDED -> "A refund was recorded for this tournament registration.";
            case SUBMITTED -> "We received your payment submission and our team will confirm it soon.";
            case NOT_REQUIRED -> "This registration does not require a payment.";
            default -> "Your tournament payment status has been updated.";
        };
    }

    private static final class ScheduleCursor {
        private LocalDate currentDate;
        private LocalTime currentTime;
        private final int matchDurationMinutes;

        private ScheduleCursor(LocalDate currentDate, LocalTime currentTime, int matchDurationMinutes) {
            this.currentDate = currentDate;
            this.currentTime = currentTime;
            this.matchDurationMinutes = matchDurationMinutes;
        }

        private static ScheduleCursor startingAt(LocalDate startDate, int matchDurationMinutes) {
            return new ScheduleCursor(startDate, LocalTime.of(9, 0), matchDurationMinutes);
        }

        private TournamentMatch createMatch(
                Tournament tournament,
                Team homeTeam,
                Team awayTeam,
                String stageName,
                String roundName) {
            TournamentMatch match = TournamentMatch.builder()
                    .tournament(tournament)
                    .homeTeam(homeTeam)
                    .awayTeam(awayTeam)
                    .stageName(stageName)
                    .roundName(roundName)
                    .matchDate(currentDate)
                    .kickoffTime(currentTime)
                    .venue(tournament.getLocation())
                    .status(MATCH_STATUS_SCHEDULED)
                    .build();
            advance();
            return match;
        }

        private void advance() {
            currentTime = currentTime.plusMinutes(matchDurationMinutes + 15L);
            if (!currentTime.isBefore(LocalTime.of(18, 0))) {
                currentDate = currentDate.plusDays(1);
                currentTime = LocalTime.of(9, 0);
            }
        }
    }

    private static class TeamStatsAccumulator {
        final String group;
        final Long teamId;
        final String teamName;
        int played;
        int won;
        int drawn;
        int lost;
        int goalsFor;
        int goalsAgainst;
        int points;

        TeamStatsAccumulator(String group, Long teamId, String teamName) {
            this.group = group;
            this.teamId = teamId;
            this.teamName = teamName;
        }
    }
}
