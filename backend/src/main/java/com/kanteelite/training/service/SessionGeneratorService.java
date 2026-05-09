package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.ScheduleRuleRequest;
import com.kanteelite.training.dto.response.ConflictReportResponse;
import com.kanteelite.training.dto.response.SessionPreviewResponse;
import com.kanteelite.training.entity.*;
import com.kanteelite.training.enums.SessionSourceType;
import com.kanteelite.training.enums.SessionStatus;
import com.kanteelite.training.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionGeneratorService {

    private final SessionRepository sessionRepository;
    private final ProgramScheduleRuleRepository programScheduleRuleRepository;
    private final EventScheduleRuleRepository eventScheduleRuleRepository;
    private final ConflictDetectionService conflictDetectionService;
    private final ProgramRepository programRepository;
    private final EventRepository eventRepository;

    @Transactional
    public void regenerateForProgram(Program program) {
        if (program.getId() == null) {
            return;
        }
        sessionRepository.deleteBySourceTypeAndSourceIdAndStartDatetimeGreaterThanEqual(
                SessionSourceType.PROGRAM, program.getId(), LocalDateTime.now().minusMinutes(1));
        generateProgramSessions(program, programScheduleRuleRepository.findByProgramIdOrderByDayOfWeekAscStartTimeAsc(program.getId()));
    }

    @Transactional
    public void regenerateForEvent(Event event) {
        if (event.getId() == null) {
            return;
        }
        sessionRepository.deleteBySourceTypeAndSourceIdAndStartDatetimeGreaterThanEqual(
                SessionSourceType.EVENT, event.getId(), LocalDateTime.now().minusMinutes(1));
        generateEventSessions(event, eventScheduleRuleRepository.findByEventIdOrderByDayOfWeekAscStartTimeAsc(event.getId()));
    }

    @Transactional(readOnly = true)
    public List<SessionPreviewResponse> previewProgramSessions(Program program, List<ScheduleRuleRequest> rules) {
        return buildPreview(
                program.getCoachUser() != null ? program.getCoachUser().getId() : null,
                toWindowCandidates(
                program.isRecurring(),
                        program.getStartDate(),
                        program.getEndDate(),
                        program.getStartAt(),
                        program.getEndAt(),
                        rules));
    }

    @Transactional(readOnly = true)
    public List<SessionPreviewResponse> previewEventSessions(Event event, List<ScheduleRuleRequest> rules) {
        return buildPreview(
                event.getCoachUser() != null ? event.getCoachUser().getId() : null,
                toWindowCandidates(
                        event.isRecurring(),
                        event.getStartDate(),
                        event.getEndDate(),
                        event.getStartAt(),
                        event.getEndAt(),
                        rules));
    }

    @Scheduled(cron = "0 15 2 * * *")
    @Transactional
    public void archivePastSessions() {
        List<Session> sessions = sessionRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        for (Session session : sessions) {
            if (session.getStatus() == SessionStatus.SCHEDULED && session.getEndDatetime().isBefore(now)) {
                session.setStatus(SessionStatus.COMPLETED);
                sessionRepository.save(session);
            }
        }
    }

    @Scheduled(cron = "0 30 2 * * *")
    @Transactional
    public void ensureFutureRecurringSessions() {
        programRepository.findAll().stream()
                .filter(Program::isRecurring)
                .forEach(this::regenerateForProgram);
        eventRepository.findAll().stream()
                .filter(Event::isRecurring)
                .forEach(this::regenerateForEvent);
    }

    private void generateProgramSessions(Program program, List<ProgramScheduleRule> rules) {
        List<WindowCandidate> candidates = toWindowCandidates(
                program.isRecurring(),
                program.getStartDate(),
                program.getEndDate(),
                program.getStartAt(),
                program.getEndAt(),
                rules.stream().map(this::toRequest).toList());
        persistCandidates(SessionSourceType.PROGRAM, program.getId(), program.getCoachUser(), program.getCapacity(), candidates);
    }

    private void generateEventSessions(Event event, List<EventScheduleRule> rules) {
        List<WindowCandidate> candidates = toWindowCandidates(
                event.isRecurring(),
                event.getStartDate(),
                event.getEndDate(),
                event.getStartAt(),
                event.getEndAt(),
                rules.stream().map(this::toRequest).toList());
        persistCandidates(SessionSourceType.EVENT, event.getId(), event.getCoachUser(), event.getCapacity(), candidates);
    }

    private List<SessionPreviewResponse> buildPreview(Long coachId, List<WindowCandidate> candidates) {
        return candidates.stream()
                .map(candidate -> {
                    ConflictReportResponse conflict = conflictDetectionService.checkConflicts(
                            coachId, candidate.startDatetime(), candidate.endDatetime());
                    return SessionPreviewResponse.builder()
                            .startDatetime(candidate.startDatetime())
                            .endDatetime(candidate.endDatetime())
                            .conflict(conflict.isHasConflict())
                            .reasons(conflict.getReasons())
                            .build();
                })
                .sorted(Comparator.comparing(SessionPreviewResponse::getStartDatetime))
                .toList();
    }

    private void persistCandidates(
            SessionSourceType sourceType,
            Long sourceId,
            User coach,
            Integer capacity,
            List<WindowCandidate> candidates) {
        if (sourceId == null || coach == null) {
            return;
        }
        int safeCapacity = capacity != null && capacity > 0 ? capacity : 20;
        for (WindowCandidate candidate : candidates) {
            ConflictReportResponse conflict = conflictDetectionService.checkConflicts(
                    coach.getId(), candidate.startDatetime(), candidate.endDatetime());
            if (conflict.isHasConflict()) {
                log.info("Skipping session generation for {} {} due to conflicts: {}", sourceType, sourceId, conflict.getReasons());
                continue;
            }
            Session session = Session.builder()
                    .sourceType(sourceType)
                    .sourceId(sourceId)
                    .coachUser(coach)
                    .startDatetime(candidate.startDatetime())
                    .endDatetime(candidate.endDatetime())
                    .capacity(safeCapacity)
                    .registeredCount(0)
                    .status(SessionStatus.SCHEDULED)
                    .build();
            sessionRepository.save(session);
        }
    }

    private List<WindowCandidate> toWindowCandidates(
            boolean recurring,
            LocalDate startDate,
            LocalDate endDate,
            LocalDateTime oneTimeStart,
            LocalDateTime oneTimeEnd,
            List<ScheduleRuleRequest> rules) {
        List<WindowCandidate> candidates = new ArrayList<>();
        if (!recurring) {
            if (oneTimeStart != null && oneTimeEnd != null && oneTimeEnd.isAfter(oneTimeStart)) {
                candidates.add(new WindowCandidate(oneTimeStart, oneTimeEnd));
            }
            return candidates;
        }
        if (startDate == null || endDate == null || rules == null || rules.isEmpty()) {
            return candidates;
        }

        LocalDate cursor = startDate;
        while (!cursor.isAfter(endDate)) {
            int day = toDayOfWeekNumber(cursor.getDayOfWeek());
            for (ScheduleRuleRequest rule : rules) {
                if (rule.getDayOfWeek() == null || !rule.getDayOfWeek().equals(day)) {
                    continue;
                }
                LocalTime startTime = rule.getStartTime();
                LocalTime endTime = rule.getEndTime();
                if (startTime == null || endTime == null || !endTime.isAfter(startTime)) {
                    continue;
                }
                candidates.add(new WindowCandidate(
                        LocalDateTime.of(cursor, startTime),
                        LocalDateTime.of(cursor, endTime)));
            }
            cursor = cursor.plusDays(1);
        }
        candidates.sort(Comparator.comparing(WindowCandidate::startDatetime));
        return candidates;
    }

    private int toDayOfWeekNumber(DayOfWeek dayOfWeek) {
        return dayOfWeek == DayOfWeek.SUNDAY ? 0 : dayOfWeek.getValue();
    }

    private ScheduleRuleRequest toRequest(ProgramScheduleRule rule) {
        ScheduleRuleRequest request = new ScheduleRuleRequest();
        request.setDayOfWeek(rule.getDayOfWeek());
        request.setStartTime(rule.getStartTime());
        request.setEndTime(rule.getEndTime());
        return request;
    }

    private ScheduleRuleRequest toRequest(EventScheduleRule rule) {
        ScheduleRuleRequest request = new ScheduleRuleRequest();
        request.setDayOfWeek(rule.getDayOfWeek());
        request.setStartTime(rule.getStartTime());
        request.setEndTime(rule.getEndTime());
        return request;
    }

    private record WindowCandidate(LocalDateTime startDatetime, LocalDateTime endDatetime) {
    }
}
