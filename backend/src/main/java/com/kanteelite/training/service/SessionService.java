package com.kanteelite.training.service;

import com.kanteelite.training.dto.response.SessionResponse;
import com.kanteelite.training.entity.Event;
import com.kanteelite.training.entity.Program;
import com.kanteelite.training.entity.Session;
import com.kanteelite.training.enums.SessionSourceType;
import com.kanteelite.training.enums.SessionStatus;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.EventRepository;
import com.kanteelite.training.repository.ProgramRepository;
import com.kanteelite.training.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final ProgramRepository programRepository;
    private final EventRepository eventRepository;

    @Transactional(readOnly = true)
    public List<SessionResponse> getUpcomingSessions() {
        return sessionRepository.findByStatusAndStartDatetimeGreaterThanEqualOrderByStartDatetimeAsc(
                        SessionStatus.SCHEDULED, LocalDateTime.now())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getAllSessions() {
        return sessionRepository.findAll().stream()
                .sorted((a, b) -> a.getStartDatetime().compareTo(b.getStartDatetime()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public SessionResponse cancelSession(Long id) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session", id));
        session.setStatus(SessionStatus.CANCELLED);
        sessionRepository.save(session);
        return toResponse(session);
    }

    private SessionResponse toResponse(Session session) {
        return SessionResponse.builder()
                .id(session.getId())
                .sourceType(session.getSourceType() != null ? session.getSourceType().name() : null)
                .sourceId(session.getSourceId())
                .sourceTitle(resolveSourceTitle(session.getSourceType(), session.getSourceId()))
                .coachId(session.getCoachUser() != null ? session.getCoachUser().getId() : null)
                .coachName(session.getCoachUser() != null ? session.getCoachUser().getName() : null)
                .startDatetime(session.getStartDatetime())
                .endDatetime(session.getEndDatetime())
                .capacity(session.getCapacity())
                .registeredCount(session.getRegisteredCount())
                .status(session.getStatus() != null ? session.getStatus().name() : null)
                .availableSpots(Math.max((session.getCapacity() != null ? session.getCapacity() : 0)
                        - (session.getRegisteredCount() != null ? session.getRegisteredCount() : 0), 0))
                .build();
    }

    private String resolveSourceTitle(SessionSourceType sourceType, Long sourceId) {
        if (sourceType == SessionSourceType.PROGRAM) {
            return programRepository.findById(sourceId).map(Program::getName).orElse("Program");
        }
        if (sourceType == SessionSourceType.EVENT) {
            return eventRepository.findById(sourceId).map(Event::getTitle).orElse("Event");
        }
        return "Session";
    }
}
