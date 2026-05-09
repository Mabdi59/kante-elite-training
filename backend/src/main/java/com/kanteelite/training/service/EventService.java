package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.EventRequest;
import com.kanteelite.training.dto.request.EventParticipationRequest;
import com.kanteelite.training.dto.request.SimpleEventRegistrationRequest;
import com.kanteelite.training.dto.request.ParticipantAssignmentRequest;
import com.kanteelite.training.dto.request.ScheduleRuleRequest;
import com.kanteelite.training.dto.response.EventResponse;
import com.kanteelite.training.dto.response.EventWorkflowResponse;
import com.kanteelite.training.dto.response.ManagedParticipantResponse;
import com.kanteelite.training.dto.response.ScheduleRuleResponse;
import com.kanteelite.training.dto.response.SessionPreviewResponse;
import com.kanteelite.training.dto.response.SessionResponse;
import com.kanteelite.training.entity.Event;
import com.kanteelite.training.entity.EventScheduleRule;
import com.kanteelite.training.entity.EventParticipant;
import com.kanteelite.training.entity.PlayerProfile;
import com.kanteelite.training.entity.Session;
import com.kanteelite.training.entity.User;
import com.kanteelite.training.enums.EventType;
import com.kanteelite.training.enums.SessionSourceType;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.EventScheduleRuleRepository;
import com.kanteelite.training.repository.EventParticipantRepository;
import com.kanteelite.training.repository.EventRepository;
import com.kanteelite.training.repository.PlayerProfileRepository;
import com.kanteelite.training.repository.SessionRepository;
import com.kanteelite.training.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EventService {

    private static final List<String> ALLOWED_STATUSES = List.of("UPCOMING", "ACTIVE", "COMPLETED");

    private final EventRepository eventRepository;
    private final EventParticipantRepository eventParticipantRepository;
    private final UserRepository userRepository;
    private final PlayerProfileRepository playerProfileRepository;
    private final EventScheduleRuleRepository eventScheduleRuleRepository;
    private final SessionRepository sessionRepository;
    private final SessionGeneratorService sessionGeneratorService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<EventResponse> getUpcomingEvents() {
        return eventRepository.findByStatusNotOrderByDisplayOrderAscStartDateAsc("COMPLETED")
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public EventResponse getEventById(Long id) {
        return toResponse(getEventEntity(id));
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getEventSessions(Long id, boolean futureOnly) {
        getEventEntity(id);
        List<Session> sessions = futureOnly
                ? sessionRepository.findBySourceTypeAndSourceIdAndStartDatetimeGreaterThanEqualOrderByStartDatetimeAsc(
                        SessionSourceType.EVENT, id, LocalDateTime.now())
                : sessionRepository.findBySourceTypeAndSourceIdOrderByStartDatetimeAsc(SessionSourceType.EVENT, id);
        return sessions.stream().map(this::toSessionResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<SessionPreviewResponse> previewSessions(EventRequest request) {
        Event preview = Event.builder()
                .coachUser(resolveCoachFromRequest(request))
                .recurring(Boolean.TRUE.equals(request.getRecurring()))
                .startDate(resolveStartDate(request))
                .endDate(resolveEndDate(request))
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .build();
        return sessionGeneratorService.previewEventSessions(
                preview,
                request.getScheduleRules() != null ? request.getScheduleRules() : List.of());
    }

    @Transactional(readOnly = true)
    public EventWorkflowResponse getEventWorkflow(Long id) {
        Event event = getEventEntity(id);
        List<ManagedParticipantResponse> participants = eventParticipantRepository.findByEventIdOrderByCreatedAtAsc(id)
                .stream()
                .map(this::toParticipantResponse)
                .toList();
        long participantCount = participants.size();
        return EventWorkflowResponse.builder()
                .event(toResponse(event))
                .participants(participants)
                .participantCount(participantCount)
                .capacityReached(isCapacityReached(resolveCapacity(event), participantCount))
                .build();
    }

    @Transactional
    public EventResponse createEvent(EventRequest req) {
        Event event = Event.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .location(req.getLocation())
                .venue(req.getVenue())
                .startDate(resolveStartDate(req))
                .endDate(resolveEndDate(req))
                .startAt(req.getStartAt())
                .endAt(req.getEndAt())
                .coachUser(resolveCoachFromRequest(req))
                .recurring(Boolean.TRUE.equals(req.getRecurring()))
                .capacity(resolveCapacity(req))
                .ageGroup(req.getAgeGroup())
                .spotsTotal(resolveCapacity(req))
                .spotsLeft(resolveCapacity(req))
                .price(req.getPrice())
                .status(normalizeStatus(req.getStatus()))
                .type(req.getType())
                .eventType(resolveEventType(req.getEventType(), req.getType()))
                .intensity(req.getIntensity())
                .coachName(req.getCoachName())
                .displayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0)
                .build();
        Event saved = eventRepository.save(event);
        replaceScheduleRules(saved, req.getScheduleRules());
        sessionGeneratorService.regenerateForEvent(saved);
        return toResponse(saved);
    }

    @Transactional
    public EventResponse updateEvent(Long id, EventRequest req) {
        Event event = getEventEntity(id);
        event.setTitle(req.getTitle());
        event.setDescription(req.getDescription());
        event.setLocation(req.getLocation());
        event.setVenue(req.getVenue());
        event.setStartDate(resolveStartDate(req));
        event.setEndDate(resolveEndDate(req));
        event.setStartAt(req.getStartAt());
        event.setEndAt(req.getEndAt());
        event.setCoachUser(resolveCoachFromRequest(req));
        event.setRecurring(Boolean.TRUE.equals(req.getRecurring()));
        event.setCapacity(resolveCapacity(req));
        event.setAgeGroup(req.getAgeGroup());
        event.setSpotsTotal(resolveCapacity(req));
        event.setPrice(req.getPrice());
        event.setStatus(normalizeStatus(req.getStatus()));
        event.setType(req.getType());
        event.setEventType(resolveEventType(req.getEventType(), req.getType()));
        event.setIntensity(req.getIntensity());
        event.setCoachName(req.getCoachName());
        if (req.getDisplayOrder() != null) event.setDisplayOrder(req.getDisplayOrder());
        Event saved = eventRepository.save(event);
        replaceScheduleRules(saved, req.getScheduleRules());
        sessionGeneratorService.regenerateForEvent(saved);
        notifyEventLifecycle(saved, "updated", "Event details were updated. Please review your schedule.");
        return toResponse(saved);
    }

    @Transactional
    public ManagedParticipantResponse addParticipant(Long eventId, ParticipantAssignmentRequest request) {
        Event event = getEventEntity(eventId);
        long participantCount = eventParticipantRepository.countByEventId(eventId);
        if (isCapacityReached(resolveCapacity(event), participantCount)) {
            throw new IllegalArgumentException("Event capacity has been reached.");
        }

        EventParticipant participant = EventParticipant.builder()
                .event(event)
                .build();

        if (request.getUserId() != null) {
            if (eventParticipantRepository.existsByEventIdAndUserId(eventId, request.getUserId())) {
                throw new IllegalArgumentException("That user is already in this event.");
            }
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getUserId()));
            participant.setUser(user);
        } else if (request.getPlayerProfileId() != null) {
            if (eventParticipantRepository.existsByEventIdAndPlayerProfileId(eventId, request.getPlayerProfileId())) {
                throw new IllegalArgumentException("That player is already in this event.");
            }
            PlayerProfile playerProfile = playerProfileRepository.findById(request.getPlayerProfileId())
                    .orElseThrow(() -> new ResourceNotFoundException("PlayerProfile", request.getPlayerProfileId()));
            participant.setPlayerProfile(playerProfile);
        } else {
            String manualName = trimToNull(request.getManualName());
            String manualEmail = normalizeEmail(request.getManualEmail());
            if (!StringUtils.hasText(manualName) || !StringUtils.hasText(manualEmail)) {
                throw new IllegalArgumentException("Manual participants need both a name and email.");
            }
            if (eventParticipantRepository.existsByEventIdAndManualEmailIgnoreCase(eventId, manualEmail)) {
                throw new IllegalArgumentException("That email is already registered for this event.");
            }
            participant.setManualName(manualName);
            participant.setManualEmail(manualEmail);
        }

        EventParticipant saved = eventParticipantRepository.save(participant);
        ManagedParticipantResponse response = toParticipantResponse(saved);
        notifyParticipantAssignment(event, response, true);
        return response;
    }

    @Transactional
    public ManagedParticipantResponse requestParticipation(Long eventId, EventParticipationRequest request) {
        ParticipantAssignmentRequest assignment = new ParticipantAssignmentRequest();
        assignment.setManualName(request.getName());
        assignment.setManualEmail(request.getEmail());
        return addParticipant(eventId, assignment);
    }

    /**
     * Simple direct registration to event - just name and email.
     * This is the preferred endpoint for public users joining events.
     */
    @Transactional
    public ManagedParticipantResponse registerForEvent(Long eventId, SimpleEventRegistrationRequest request) {
        ParticipantAssignmentRequest assignment = new ParticipantAssignmentRequest();
        assignment.setManualName(request.getName());
        assignment.setManualEmail(request.getEmail());
        return addParticipant(eventId, assignment);
    }

    @Transactional
    public void removeParticipant(Long eventId, Long participantId) {
        EventParticipant participant = eventParticipantRepository.findByIdAndEventId(participantId, eventId)
                .orElseThrow(() -> new ResourceNotFoundException("EventParticipant", participantId));
        ManagedParticipantResponse participantResponse = toParticipantResponse(participant);
        Event event = participant.getEvent();
        eventParticipantRepository.delete(participant);
        notifyParticipantAssignment(event, participantResponse, false);
    }

    @Transactional
    public void deleteEvent(Long id) {
        Event event = getEventEntity(id);
        List<EventParticipant> participants = eventParticipantRepository.findByEventIdOrderByCreatedAtAsc(id);
        eventRepository.deleteById(id);
        notifyEventLifecycle(event, participants, "cancelled", "This event has been cancelled and removed.");
    }

    private Event getEventEntity(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
    }

    private EventResponse toResponse(Event event) {
        long participantCount = event.getId() != null
                ? eventParticipantRepository.countByEventId(event.getId())
                : 0;
        List<EventScheduleRule> scheduleRules = event.getId() != null
                ? eventScheduleRuleRepository.findByEventIdOrderByDayOfWeekAscStartTimeAsc(event.getId())
                : List.of();
        long upcomingSessionCount = event.getId() != null
                ? sessionRepository.findBySourceTypeAndSourceIdAndStartDatetimeGreaterThanEqualOrderByStartDatetimeAsc(
                        SessionSourceType.EVENT, event.getId(), LocalDateTime.now()).size()
                : 0;
        int capacity = resolveCapacity(event);
        int spotsLeft = Math.max(capacity - (int) participantCount, 0);
        LocalDate startDate = event.getStartAt() != null ? event.getStartAt().toLocalDate() : event.getStartDate();
        LocalDate endDate = event.getEndAt() != null ? event.getEndAt().toLocalDate() : event.getEndDate();

        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .location(event.getLocation())
                .venue(event.getVenue())
                .startDate(startDate)
                .endDate(endDate)
                .startAt(event.getStartAt())
                .endAt(event.getEndAt())
                .coachId(event.getCoachUser() != null ? event.getCoachUser().getId() : null)
                .recurring(event.isRecurring())
                .eventType(event.getEventType() != null ? event.getEventType().name() : null)
                .capacity(capacity)
                .participantCount(participantCount)
                .upcomingSessionCount(upcomingSessionCount)
                .ageGroup(event.getAgeGroup())
                .spotsTotal(capacity)
                .spotsLeft(spotsLeft)
                .price(event.getPrice())
                .status(event.getStatus())
                .type(event.getType())
                .intensity(event.getIntensity())
                .coachName(event.getCoachName())
                .displayOrder(event.getDisplayOrder())
                .scheduleRules(scheduleRules.stream().map(this::toRuleResponse).toList())
                .build();
    }

    private SessionResponse toSessionResponse(Session session) {
        return SessionResponse.builder()
                .id(session.getId())
                .sourceType(session.getSourceType() != null ? session.getSourceType().name() : null)
                .sourceId(session.getSourceId())
                .sourceTitle(eventRepository.findById(session.getSourceId()).map(Event::getTitle).orElse("Event"))
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

    private void replaceScheduleRules(Event event, List<ScheduleRuleRequest> requests) {
        eventScheduleRuleRepository.deleteByEventId(event.getId());
        if (requests == null || requests.isEmpty()) {
            return;
        }
        for (ScheduleRuleRequest req : requests) {
            if (req.getDayOfWeek() == null || req.getStartTime() == null || req.getEndTime() == null
                    || !req.getEndTime().isAfter(req.getStartTime())) {
                continue;
            }
            EventScheduleRule rule = EventScheduleRule.builder()
                    .event(event)
                    .dayOfWeek(req.getDayOfWeek())
                    .startTime(req.getStartTime())
                    .endTime(req.getEndTime())
                    .build();
            eventScheduleRuleRepository.save(rule);
        }
    }

    private ScheduleRuleResponse toRuleResponse(EventScheduleRule rule) {
        return ScheduleRuleResponse.builder()
                .id(rule.getId())
                .dayOfWeek(rule.getDayOfWeek())
                .startTime(rule.getStartTime())
                .endTime(rule.getEndTime())
                .build();
    }

    private ManagedParticipantResponse toParticipantResponse(EventParticipant participant) {
        if (participant.getUser() != null) {
            return ManagedParticipantResponse.builder()
                    .id(participant.getId())
                    .userId(participant.getUser().getId())
                    .participantType("USER")
                    .name(participant.getUser().getName())
                    .email(participant.getUser().getEmail())
                    .createdAt(participant.getCreatedAt())
                    .build();
        }
        if (participant.getPlayerProfile() != null) {
            User parentUser = participant.getPlayerProfile().getParentUser();
            return ManagedParticipantResponse.builder()
                    .id(participant.getId())
                    .playerProfileId(participant.getPlayerProfile().getId())
                    .participantType("PLAYER")
                    .name(participant.getPlayerProfile().getName())
                    .email(parentUser != null ? parentUser.getEmail() : null)
                    .createdAt(participant.getCreatedAt())
                    .build();
        }
        return ManagedParticipantResponse.builder()
                .id(participant.getId())
                .participantType("MANUAL")
                .name(participant.getManualName())
                .email(participant.getManualEmail())
                .createdAt(participant.getCreatedAt())
                .build();
    }

    private int resolveCapacity(EventRequest request) {
        if (request.getCapacity() != null && request.getCapacity() > 0) {
            return request.getCapacity();
        }
        if (request.getSpotsTotal() != null && request.getSpotsTotal() > 0) {
            return request.getSpotsTotal();
        }
        return 20;
    }

    private int resolveCapacity(Event event) {
        if (event.getCapacity() != null && event.getCapacity() > 0) {
            return event.getCapacity();
        }
        if (event.getSpotsTotal() != null && event.getSpotsTotal() > 0) {
            return event.getSpotsTotal();
        }
        return 20;
    }

    private boolean isCapacityReached(int capacity, long participantCount) {
        return capacity > 0 && participantCount >= capacity;
    }

    private String normalizeStatus(String value) {
        if (!StringUtils.hasText(value)) {
            return "UPCOMING";
        }
        String normalized = value.trim().toUpperCase(Locale.ROOT);
        return ALLOWED_STATUSES.contains(normalized) ? normalized : "UPCOMING";
    }

    private LocalDate resolveStartDate(EventRequest request) {
        LocalDateTime startAt = request.getStartAt();
        return startAt != null ? startAt.toLocalDate() : request.getStartDate();
    }

    private LocalDate resolveEndDate(EventRequest request) {
        LocalDateTime endAt = request.getEndAt();
        if (endAt != null) {
            return endAt.toLocalDate();
        }
        return request.getEndDate();
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String normalizeEmail(String value) {
        String trimmed = trimToNull(value);
        return trimmed == null ? null : trimmed.toLowerCase(Locale.ROOT);
    }

    private User resolveCoachFromRequest(EventRequest request) {
        if (request.getCoachId() == null) {
            return null;
        }
        return userRepository.findById(request.getCoachId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getCoachId()));
    }

    private EventType resolveEventType(String eventType, String type) {
        String candidate = StringUtils.hasText(eventType) ? eventType : type;
        if (!StringUtils.hasText(candidate)) {
            return EventType.ONE_TIME;
        }
        try {
            return EventType.valueOf(candidate.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return EventType.ONE_TIME;
        }
    }

    private void notifyEventLifecycle(Event event, String action, String detail) {
        List<EventParticipant> participants = eventParticipantRepository.findByEventIdOrderByCreatedAtAsc(event.getId());
        notifyEventLifecycle(event, participants, action, detail);
    }

    private void notifyEventLifecycle(Event event, List<EventParticipant> participants, String action, String detail) {
        Map<String, String> recipients = new LinkedHashMap<>();
        for (EventParticipant participant : participants) {
            ManagedParticipantResponse response = toParticipantResponse(participant);
            if (StringUtils.hasText(response.getEmail())) {
                String normalizedEmail = normalizeEmail(response.getEmail());
                recipients.putIfAbsent(normalizedEmail, response.getName());
            }
        }

        if (recipients.isEmpty()) {
            return;
        }

        String title = "Event " + action;
        String body = event.getTitle() + ": " + detail;
        for (Map.Entry<String, String> recipient : recipients.entrySet()) {
            notificationService.send(
                    recipient.getKey(),
                    "EVENT_UPDATE",
                    title,
                    body,
                    "Event",
                    event.getId());
            emailService.sendEventLifecycleEmail(
                    recipient.getKey(),
                    recipient.getValue(),
                    event.getTitle(),
                    action,
                    detail);
        }
    }

    private void notifyParticipantAssignment(Event event, ManagedParticipantResponse participant, boolean added) {
        if (!StringUtils.hasText(participant.getEmail())) {
            return;
        }

        String title = added ? "Event registration confirmed" : "Event registration removed";
        String body = added
                ? "You have been registered for " + event.getTitle() + "."
                : "You have been removed from " + event.getTitle() + ".";

        notificationService.send(
                participant.getEmail(),
                "EVENT_REGISTRATION",
                title,
                body,
                "Event",
                event.getId());

        emailService.sendEventParticipantEmail(
                participant.getEmail(),
                participant.getName(),
                event.getTitle(),
                added);
    }
}
