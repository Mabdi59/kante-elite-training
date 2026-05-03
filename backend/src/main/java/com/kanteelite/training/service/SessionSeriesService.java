package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.SessionSeriesRequest;
import com.kanteelite.training.dto.response.SessionSeriesPreviewItem;
import com.kanteelite.training.dto.response.SessionSeriesResponse;
import com.kanteelite.training.dto.response.TrainingSessionResponse;
import com.kanteelite.training.entity.PlayerProfile;
import com.kanteelite.training.entity.Program;
import com.kanteelite.training.entity.Registration;
import com.kanteelite.training.entity.SessionSeries;
import com.kanteelite.training.entity.TrainingSession;
import com.kanteelite.training.entity.User;
import com.kanteelite.training.enums.RegistrationActorType;
import com.kanteelite.training.enums.RegistrationPaymentStatus;
import com.kanteelite.training.enums.RegistrationStatus;
import com.kanteelite.training.enums.TrainingSessionStatus;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.BlockedSlotRepository;
import com.kanteelite.training.repository.PlayerProfileRepository;
import com.kanteelite.training.repository.ProgramRepository;
import com.kanteelite.training.repository.RegistrationHistoryRepository;
import com.kanteelite.training.repository.RegistrationRepository;
import com.kanteelite.training.repository.SessionSeriesRepository;
import com.kanteelite.training.repository.TrainingSessionRepository;
import com.kanteelite.training.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionSeriesService {

    private static final int DEFAULT_SERIES_WEEKS = 12;
    private static final Set<RegistrationStatus> ACTIVE_REGISTRATION_STATUSES = Set.of(
            RegistrationStatus.PENDING,
            RegistrationStatus.CONFIRMED,
            RegistrationStatus.WAITLISTED
    );

    private final SessionSeriesRepository sessionSeriesRepository;
    private final TrainingSessionRepository trainingSessionRepository;
    private final RegistrationRepository registrationRepository;
    private final RegistrationHistoryRepository registrationHistoryRepository;
    private final UserRepository userRepository;
    private final ProgramRepository programRepository;
    private final PlayerProfileRepository playerProfileRepository;
    private final BlockedSlotRepository blockedSlotRepository;
    private final RegistrationService registrationService;
    private final TrainingSessionService trainingSessionService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<SessionSeriesPreviewItem> previewSeries(SessionSeriesRequest request) {
        Program program = request.getProgramId() != null
                ? programRepository.findById(request.getProgramId()).orElse(null)
                : null;
        User coach = request.getCoachUserId() != null
                ? userRepository.findById(request.getCoachUserId()).orElse(null)
                : null;
        return buildPreview(request, program, coach);
    }

    @Transactional
    public SessionSeriesResponse createSeries(SessionSeriesRequest request, String actorEmail) {
        validateRequest(request);
        Program program = programRepository.findById(request.getProgramId())
                .orElseThrow(() -> new ResourceNotFoundException("Program", request.getProgramId()));
        User coach = request.getCoachUserId() != null
                ? userRepository.findById(request.getCoachUserId())
                        .orElseThrow(() -> new ResourceNotFoundException("Coach user", request.getCoachUserId()))
                : null;

        List<PlayerProfile> players = resolvePlayers(request.getPlayerProfileIds());
        SessionSeries series = SessionSeries.builder()
                .program(program)
                .coachUser(coach)
                .title(trim(request.getTitle()))
                .startDate(request.getStartDate())
                .endDate(resolveEndDate(request))
                .weekdays(normalizeWeekdays(request.getWeekdays()))
                .startTime(resolveStartTime(request))
                .durationMinutes(resolveDuration(request.getDurationMinutes()))
                .capacity(resolveCapacity(request.getCapacity(), players))
                .location(StringUtils.hasText(request.getLocation()) ? request.getLocation().trim() : program.getLocation())
                .notes(trim(request.getNotes()))
                .active(request.isActive())
                .players(players)
                .build();

        SessionSeries saved = sessionSeriesRepository.save(series);
        int generated = generateSessions(saved, request.getStartDate(), actorEmail);
        auditLogService.log(actorEmail, "CREATE", "SessionSeries", saved.getId(),
                "Created recurring session series with " + generated + " generated sessions.");
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SessionSeriesResponse> getAllSeries() {
        return sessionSeriesRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SessionSeriesResponse getSeries(Long id) {
        return toResponse(getSeriesEntity(id));
    }

    @Transactional(readOnly = true)
    public List<TrainingSessionResponse> getGeneratedSessions(Long id) {
        getSeriesEntity(id);
        return trainingSessionRepository.findBySessionSeriesIdOrderByScheduledDateAscStartTimeAsc(id).stream()
                .map(trainingSessionService::toResponse)
                .toList();
    }

    @Transactional
    public SessionSeriesResponse updateSeries(Long id, SessionSeriesRequest request, String actorEmail) {
        validateRequest(request);
        SessionSeries series = getSeriesEntity(id);
        Program program = programRepository.findById(request.getProgramId())
                .orElseThrow(() -> new ResourceNotFoundException("Program", request.getProgramId()));
        User coach = request.getCoachUserId() != null
                ? userRepository.findById(request.getCoachUserId())
                        .orElseThrow(() -> new ResourceNotFoundException("Coach user", request.getCoachUserId()))
                : null;
        List<PlayerProfile> players = resolvePlayers(request.getPlayerProfileIds());

        series.setProgram(program);
        series.setCoachUser(coach);
        series.setTitle(trim(request.getTitle()));
        series.setStartDate(request.getStartDate());
        series.setEndDate(resolveEndDate(request));
        series.setWeekdays(normalizeWeekdays(request.getWeekdays()));
        series.setStartTime(resolveStartTime(request));
        series.setDurationMinutes(resolveDuration(request.getDurationMinutes()));
        series.setCapacity(resolveCapacity(request.getCapacity(), players));
        series.setLocation(StringUtils.hasText(request.getLocation()) ? request.getLocation().trim() : program.getLocation());
        series.setNotes(trim(request.getNotes()));
        series.setActive(request.isActive());
        series.getPlayers().clear();
        series.getPlayers().addAll(players);

        SessionSeries saved = sessionSeriesRepository.save(series);
        cancelFutureSessions(saved.getId(), LocalDate.now(), actorEmail, "Series pattern was updated.");
        int regenerated = saved.isActive() ? generateSessions(saved, max(LocalDate.now(), saved.getStartDate()), actorEmail) : 0;
        auditLogService.log(actorEmail, "UPDATE", "SessionSeries", saved.getId(),
                "Updated recurring session series and regenerated " + regenerated + " future sessions.");
        return toResponse(saved);
    }

    @Transactional
    public void cancelSession(Long sessionId, String actorEmail) {
        TrainingSession session = trainingSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("TrainingSession", sessionId));
        session.setStatus(TrainingSessionStatus.CANCELLED);
        TrainingSession saved = trainingSessionRepository.save(session);
        cancelRegistrationsForSession(saved, actorEmail, "Recurring session was cancelled.");
        auditLogService.log(actorEmail, "CANCEL_SESSION", "TrainingSession", sessionId,
                "Cancelled generated recurring session.");
    }

    @Transactional
    public void cancelFutureSessions(Long seriesId, LocalDate fromDate, String actorEmail) {
        cancelFutureSessions(seriesId, fromDate, actorEmail, "Future recurring sessions were cancelled.");
    }

    @Transactional
    public void deleteSeries(Long seriesId, String actorEmail) {
        SessionSeries series = getSeriesEntity(seriesId);
        series.setActive(false);
        sessionSeriesRepository.save(series);
        cancelFutureSessions(seriesId, LocalDate.now(), actorEmail, "Series was deactivated.");
        auditLogService.log(actorEmail, "DELETE_SERIES", "SessionSeries", seriesId,
                "Series marked inactive and future sessions cancelled.");
    }

    private int generateSessions(SessionSeries series, LocalDate fromDate, String actorEmail) {
        List<DayOfWeek> weekdays = parseWeekdays(series.getWeekdays());
        LocalDate cursor = max(fromDate, series.getStartDate());
        int generated = 0;

        while (!cursor.isAfter(series.getEndDate())) {
            if (weekdays.contains(cursor.getDayOfWeek())) {
                if (!blockedSlotRepository.findBlockingSlots(cursor, series.getStartTime()).isEmpty()) {
                    log.info("Skipping blocked recurring session on {} at {}", cursor, series.getStartTime());
                } else if (hasCoachConflict(series, cursor)) {
                    log.info("Skipping conflicted recurring session on {} at {}", cursor, series.getStartTime());
                } else {
                    TrainingSession session = findExistingSeriesSession(series.getId(), cursor, series.getStartTime());
                    if (session == null) {
                        session = TrainingSession.builder()
                                .program(series.getProgram())
                                .event(series.getEvent())
                                .sessionSeries(series)
                                .scheduledDate(cursor)
                                .startTime(series.getStartTime())
                                .endTime(resolveEndTime(series.getStartTime(), series.getDurationMinutes()))
                                .timezone("America/Chicago")
                                .location(series.getLocation())
                                .coachUser(series.getCoachUser())
                                .capacity(series.getCapacity())
                                .status(TrainingSessionStatus.SCHEDULED)
                                .notes(series.getNotes())
                                .build();
                        session = trainingSessionRepository.save(session);
                        generated++;
                    }
                    createAssignedPlayerRegistrations(session, series.getPlayers(), actorEmail, series.getNotes());
                }
            }
            cursor = cursor.plusDays(1);
        }
        return generated;
    }

    private void createAssignedPlayerRegistrations(
            TrainingSession session,
            List<PlayerProfile> players,
            String actorEmail,
            String notes
    ) {
        for (PlayerProfile player : players) {
            registrationService.createSessionSeriesRegistration(session, player, actorEmail, notes);
        }
    }

    private List<SessionSeriesPreviewItem> buildPreview(SessionSeriesRequest request, Program program, User coach) {
        if (request.getStartDate() == null || !StringUtils.hasText(request.getWeekdays())
                || !StringUtils.hasText(resolveStartTime(request))) {
            return List.of();
        }
        LocalDate endDate = resolveEndDate(request);
        List<DayOfWeek> weekdays = parseWeekdays(request.getWeekdays());
        List<SessionSeriesPreviewItem> items = new ArrayList<>();
        LocalDate cursor = request.getStartDate();
        while (!cursor.isAfter(endDate)) {
            DayOfWeek cursorDay = cursor.getDayOfWeek();
            if (weekdays.contains(cursorDay)) {
                String conflictReason = null;
                if (coach != null && trainingSessionRepository.existsCoachConflict(
                        coach.getId(), cursor, resolveStartTime(request), TrainingSessionStatus.CANCELLED, -1L)) {
                    conflictReason = "Coach already has a session at this time";
                } else if (!blockedSlotRepository.findBlockingSlots(cursor, resolveStartTime(request)).isEmpty()) {
                    conflictReason = "Date/time is blocked";
                }
                items.add(SessionSeriesPreviewItem.builder()
                        .date(cursor)
                        .dayOfWeek(cursorDay.name())
                        .startTime(resolveStartTime(request))
                        .coachName(coach != null ? coach.getName() : null)
                        .programName(program != null ? program.getName() : null)
                        .conflict(conflictReason != null)
                        .conflictReason(conflictReason)
                        .build());
            }
            cursor = cursor.plusDays(1);
        }
        return items;
    }

    private void cancelFutureSessions(Long seriesId, LocalDate fromDate, String actorEmail, String reason) {
        List<TrainingSession> sessions = trainingSessionRepository
                .findBySessionSeriesIdAndScheduledDateGreaterThanEqualOrderByScheduledDateAscStartTimeAsc(seriesId, fromDate);
        int count = 0;
        for (TrainingSession session : sessions) {
            if (session.getStatus() != TrainingSessionStatus.CANCELLED) {
                session.setStatus(TrainingSessionStatus.CANCELLED);
                TrainingSession saved = trainingSessionRepository.save(session);
                cancelRegistrationsForSession(saved, actorEmail, reason);
                count++;
            }
        }
        auditLogService.log(actorEmail, "CANCEL_FUTURE_SESSIONS", "SessionSeries", seriesId,
                "Cancelled " + count + " generated sessions from " + fromDate + ".");
    }

    private void cancelRegistrationsForSession(TrainingSession session, String actorEmail, String reason) {
        registrationRepository.findByTrainingSessionIdOrderByCreatedAtAsc(session.getId()).forEach(registration -> {
            if (!ACTIVE_REGISTRATION_STATUSES.contains(registration.getStatus())) {
                return;
            }
            RegistrationStatus previousStatus = registration.getStatus();
            RegistrationPaymentStatus previousPaymentStatus = registration.getPaymentStatus();
            registration.setStatus(RegistrationStatus.CANCELLED);
            registration.setCancelledAt(java.time.LocalDateTime.now());
            registration.setCancelledByType(RegistrationActorType.ADMIN.name());
            registration.setCancelledByLabel(actorEmail);
            registration.setCancellationReason(reason);
            Registration saved = registrationRepository.save(registration);
            registrationHistoryRepository.save(com.kanteelite.training.entity.RegistrationHistory.builder()
                    .registration(saved)
                    .eventType("SESSION_SERIES_CANCELLED")
                    .message(reason)
                    .previousStatus(previousStatus)
                    .newStatus(saved.getStatus())
                    .previousPaymentStatus(previousPaymentStatus)
                    .newPaymentStatus(saved.getPaymentStatus())
                    .actorType(RegistrationActorType.ADMIN)
                    .actorLabel(actorEmail)
                    .build());
        });
    }

    private TrainingSession findExistingSeriesSession(Long seriesId, LocalDate date, String startTime) {
        return trainingSessionRepository.findBySessionSeriesIdOrderByScheduledDateAscStartTimeAsc(seriesId).stream()
                .filter(session -> date.equals(session.getScheduledDate()))
                .filter(session -> startTime.equals(session.getStartTime()))
                .filter(session -> session.getStatus() != TrainingSessionStatus.CANCELLED)
                .findFirst()
                .orElse(null);
    }

    private boolean hasCoachConflict(SessionSeries series, LocalDate date) {
        return series.getCoachUser() != null && trainingSessionRepository.existsCoachConflict(
                series.getCoachUser().getId(),
                date,
                series.getStartTime(),
                TrainingSessionStatus.CANCELLED,
                -1L);
    }

    private SessionSeriesResponse toResponse(SessionSeries series) {
        List<TrainingSession> sessions = trainingSessionRepository.findBySessionSeriesIdOrderByScheduledDateAscStartTimeAsc(series.getId());
        LocalDate today = LocalDate.now();
        List<SessionSeriesResponse.PlayerSummary> playerSummaries = series.getPlayers().stream()
                .sorted(Comparator.comparing(PlayerProfile::getName, String.CASE_INSENSITIVE_ORDER))
                .map(player -> SessionSeriesResponse.PlayerSummary.builder()
                        .id(player.getId())
                        .name(player.getName())
                        .parentUserEmail(player.getParentUser() != null ? player.getParentUser().getEmail() : null)
                        .build())
                .toList();

        return SessionSeriesResponse.builder()
                .id(series.getId())
                .coachUserId(series.getCoachUser() != null ? series.getCoachUser().getId() : null)
                .coachName(series.getCoachUser() != null ? series.getCoachUser().getName() : null)
                .coachEmail(series.getCoachUser() != null ? series.getCoachUser().getEmail() : null)
                .programId(series.getProgram() != null ? series.getProgram().getId() : null)
                .programName(series.getProgram() != null ? series.getProgram().getName() : null)
                .title(series.getTitle())
                .startDate(series.getStartDate())
                .endDate(series.getEndDate())
                .weekdays(series.getWeekdays())
                .startTime(series.getStartTime())
                .durationMinutes(series.getDurationMinutes())
                .capacity(series.getCapacity())
                .location(series.getLocation())
                .notes(series.getNotes())
                .active(series.isActive())
                .createdAt(series.getCreatedAt())
                .updatedAt(series.getUpdatedAt())
                .players(playerSummaries)
                .totalSessions(sessions.size())
                .completedSessions((int) sessions.stream()
                        .filter(session -> session.getStatus() == TrainingSessionStatus.COMPLETED
                                || session.getScheduledDate().isBefore(today))
                        .count())
                .upcomingSessions((int) sessions.stream()
                        .filter(session -> !session.getScheduledDate().isBefore(today)
                                && session.getStatus() != TrainingSessionStatus.CANCELLED)
                        .count())
                .cancelledSessions((int) sessions.stream()
                        .filter(session -> session.getStatus() == TrainingSessionStatus.CANCELLED)
                        .count())
                .build();
    }

    private SessionSeries getSeriesEntity(Long id) {
        return sessionSeriesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SessionSeries", id));
    }

    private void validateRequest(SessionSeriesRequest request) {
        if (request.getStartDate() == null) {
            throw new IllegalArgumentException("startDate is required");
        }
        if (!StringUtils.hasText(request.getWeekdays())) {
            throw new IllegalArgumentException("At least one weekday is required");
        }
        if (!StringUtils.hasText(resolveStartTime(request))) {
            throw new IllegalArgumentException("startTime is required");
        }
        if (request.getEndDate() != null && request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("endDate cannot be before startDate");
        }
    }

    private List<PlayerProfile> resolvePlayers(List<Long> playerProfileIds) {
        if (playerProfileIds == null || playerProfileIds.isEmpty()) {
            return new ArrayList<>();
        }
        List<PlayerProfile> players = new ArrayList<>();
        for (Long playerProfileId : new LinkedHashSet<>(playerProfileIds)) {
            players.add(playerProfileRepository.findById(playerProfileId)
                    .orElseThrow(() -> new ResourceNotFoundException("PlayerProfile", playerProfileId)));
        }
        return players;
    }

    private LocalDate resolveEndDate(SessionSeriesRequest request) {
        if (request.getEndDate() != null) {
            return request.getEndDate();
        }
        if (request.getNumberOfWeeks() != null && request.getNumberOfWeeks() > 0) {
            return request.getStartDate().plusWeeks(request.getNumberOfWeeks()).minusDays(1);
        }
        return request.getStartDate().plusWeeks(DEFAULT_SERIES_WEEKS).minusDays(1);
    }

    private String resolveStartTime(SessionSeriesRequest request) {
        if (StringUtils.hasText(request.getStartTime())) {
            return request.getStartTime().trim();
        }
        return StringUtils.hasText(request.getBookingTime()) ? request.getBookingTime().trim() : null;
    }

    private String normalizeWeekdays(String weekdays) {
        return parseWeekdays(weekdays).stream()
                .map(DayOfWeek::name)
                .collect(Collectors.joining(","));
    }

    private List<DayOfWeek> parseWeekdays(String weekdays) {
        if (!StringUtils.hasText(weekdays)) {
            return List.of();
        }
        return Arrays.stream(weekdays.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .map(String::toUpperCase)
                .map(DayOfWeek::valueOf)
                .toList();
    }

    private Integer resolveDuration(Integer durationMinutes) {
        return durationMinutes != null && durationMinutes >= 15 ? durationMinutes : 60;
    }

    private Integer resolveCapacity(Integer requestedCapacity, List<PlayerProfile> players) {
        int capacity = requestedCapacity != null && requestedCapacity > 0 ? requestedCapacity : 1;
        return Math.max(capacity, players.size());
    }

    private String resolveEndTime(String startTime, Integer durationMinutes) {
        LocalTime parsed = parseTime(startTime);
        if (parsed == null) {
            return null;
        }
        return parsed.plusMinutes(resolveDuration(durationMinutes)).format(DateTimeFormatter.ofPattern("HH:mm"));
    }

    private LocalTime parseTime(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        for (DateTimeFormatter formatter : List.of(
                DateTimeFormatter.ofPattern("HH:mm"),
                DateTimeFormatter.ofPattern("H:mm"),
                DateTimeFormatter.ofPattern("h:mm a"))) {
            try {
                return LocalTime.parse(value.trim().toUpperCase(), formatter);
            } catch (DateTimeParseException ignored) {
                // Try the next accepted admin time format.
            }
        }
        return null;
    }

    private LocalDate max(LocalDate first, LocalDate second) {
        return first.isAfter(second) ? first : second;
    }

    private String trim(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
