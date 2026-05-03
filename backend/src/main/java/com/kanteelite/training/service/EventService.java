package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.EventRequest;
import com.kanteelite.training.dto.request.EventParticipationRequest;
import com.kanteelite.training.dto.request.SimpleEventRegistrationRequest;
import com.kanteelite.training.dto.request.ParticipantAssignmentRequest;
import com.kanteelite.training.dto.response.EventResponse;
import com.kanteelite.training.dto.response.EventWorkflowResponse;
import com.kanteelite.training.dto.response.ManagedParticipantResponse;
import com.kanteelite.training.entity.Event;
import com.kanteelite.training.entity.PlayerProfile;
import com.kanteelite.training.entity.Registration;
import com.kanteelite.training.entity.TrainingSession;
import com.kanteelite.training.entity.User;
import com.kanteelite.training.enums.RegistrationOfferingType;
import com.kanteelite.training.enums.RegistrationPaymentStatus;
import com.kanteelite.training.enums.RegistrationSource;
import com.kanteelite.training.enums.RegistrationStatus;
import com.kanteelite.training.enums.RegistrationType;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.EventRepository;
import com.kanteelite.training.repository.PlayerProfileRepository;
import com.kanteelite.training.repository.RegistrationRepository;
import com.kanteelite.training.repository.TrainingSessionRepository;
import com.kanteelite.training.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventService {

    private static final List<String> ALLOWED_STATUSES = List.of("UPCOMING", "ACTIVE", "COMPLETED");
    private static final Set<RegistrationStatus> CAPACITY_HOLDING_STATUSES = EnumSet.of(
            RegistrationStatus.PENDING,
            RegistrationStatus.CONFIRMED,
            RegistrationStatus.WAITLISTED
    );

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final TrainingSessionRepository trainingSessionRepository;
    private final UserRepository userRepository;
    private final PlayerProfileRepository playerProfileRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final TrainingSessionService trainingSessionService;
    private final RegistrationService registrationService;

    @Transactional(readOnly = true)
    public List<EventResponse> getUpcomingEvents() {
        return eventRepository.findByActiveTrueAndStatusNotOrderByDisplayOrderAscStartDateAsc("COMPLETED")
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
    public EventWorkflowResponse getEventWorkflow(Long id) {
        Event event = getEventEntity(id);
        List<ManagedParticipantResponse> participants = findEventRosterRegistrations(id)
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
                .capacity(resolveCapacity(req))
                .ageGroup(req.getAgeGroup())
                .spotsTotal(resolveCapacity(req))
                .spotsLeft(resolveCapacity(req))
                .price(req.getPrice())
                .status(normalizeStatus(req.getStatus()))
                .type(req.getType())
                .intensity(req.getIntensity())
                .coachName(trimToNull(req.getCoachName()))
                .primaryMediaUrl(trimToNull(req.getPrimaryMediaUrl()))
                .secondaryMediaUrl(trimToNull(req.getSecondaryMediaUrl()))
                .featured(req.isFeatured())
                .active(req.isActive())
                .allowWaitlist(req.isAllowWaitlist())
                .displayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0)
                .build();
        return toResponse(eventRepository.save(event));
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
        event.setCapacity(resolveCapacity(req));
        event.setAgeGroup(req.getAgeGroup());
        event.setSpotsTotal(resolveCapacity(req));
        event.setPrice(req.getPrice());
        event.setStatus(normalizeStatus(req.getStatus()));
        event.setType(req.getType());
        event.setIntensity(req.getIntensity());
        event.setCoachName(trimToNull(req.getCoachName()));
        event.setPrimaryMediaUrl(trimToNull(req.getPrimaryMediaUrl()));
        event.setSecondaryMediaUrl(trimToNull(req.getSecondaryMediaUrl()));
        event.setFeatured(req.isFeatured());
        event.setActive(req.isActive());
        event.setAllowWaitlist(req.isAllowWaitlist());
        if (req.getDisplayOrder() != null) event.setDisplayOrder(req.getDisplayOrder());
        Event saved = eventRepository.save(event);
        notifyEventLifecycle(saved, "updated", "Event details were updated. Please review your schedule.");
        return toResponse(saved);
    }

    @Transactional
    public ManagedParticipantResponse addParticipant(Long eventId, ParticipantAssignmentRequest request) {
        Event event = getEventEntity(eventId);
        long participantCount = registrationRepository.countByEventIdAndStatusIn(eventId, CAPACITY_HOLDING_STATUSES);
        if (isCapacityReached(resolveCapacity(event), participantCount)) {
            throw new IllegalArgumentException("Event capacity has been reached.");
        }

        Registration participant = Registration.builder()
                .registrationCode(generateCode())
                .offeringType(RegistrationOfferingType.EVENT)
                .registrationType(RegistrationType.EVENT_REGISTRATION)
                .status(RegistrationStatus.CONFIRMED)
                .paymentStatus(RegistrationPaymentStatus.UNPAID)
                .source(RegistrationSource.PUBLIC)
                .event(event)
                .priceAmount(event.getPrice())
                .build();

        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getUserId()));
            String userEmail = normalizeEmail(user.getEmail());
            if (existsActiveRegistrationByEmail(eventId, userEmail)) {
                throw new IllegalArgumentException("That user is already in this event.");
            }
            participant.setParticipantName(user.getName());
            participant.setParticipantEmail(userEmail);
            participant.setGuardianName(user.getName());
            participant.setGuardianEmail(userEmail);
        } else if (request.getPlayerProfileId() != null) {
            PlayerProfile playerProfile = playerProfileRepository.findById(request.getPlayerProfileId())
                    .orElseThrow(() -> new ResourceNotFoundException("PlayerProfile", request.getPlayerProfileId()));
            User parentUser = playerProfile.getParentUser();
            String parentEmail = parentUser != null ? normalizeEmail(parentUser.getEmail()) : null;
            if (!StringUtils.hasText(parentEmail)) {
                throw new IllegalArgumentException("That player profile is missing a parent email.");
            }
            if (existsActiveRegistrationByEmail(eventId, parentEmail)) {
                throw new IllegalArgumentException("That player is already in this event.");
            }
            participant.setParticipantName(playerProfile.getName());
            participant.setGuardianName(parentUser != null ? parentUser.getName() : playerProfile.getName());
            participant.setGuardianEmail(parentEmail);
            participant.setParticipantEmail(parentEmail);
        } else {
            String manualName = trimToNull(request.getManualName());
            String manualEmail = normalizeEmail(request.getManualEmail());
            if (!StringUtils.hasText(manualName) || !StringUtils.hasText(manualEmail)) {
                throw new IllegalArgumentException("Manual participants need both a name and email.");
            }
            if (existsActiveRegistrationByEmail(eventId, manualEmail)) {
                throw new IllegalArgumentException("That email is already in this event.");
            }
            participant.setParticipantName(manualName);
            participant.setParticipantEmail(manualEmail);
            participant.setGuardianName(manualName);
            participant.setGuardianEmail(manualEmail);
        }

        Registration saved = registrationRepository.save(participant);
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
        if (request.getTrainingSessionIds() != null && !request.getTrainingSessionIds().isEmpty()) {
            Event event = getEventEntity(eventId);
            List<TrainingSession> sessions = trainingSessionRepository.findAllById(request.getTrainingSessionIds())
                    .stream()
                    .filter(session -> session.getEvent() != null && eventId.equals(session.getEvent().getId()))
                    .toList();

            if (sessions.size() != request.getTrainingSessionIds().size()) {
                throw new IllegalArgumentException("One or more selected sessions are not available for this event.");
            }

            String packageType = StringUtils.hasText(request.getPackageType()) ? request.getPackageType() : "DROP_IN";
            BigDecimal fullWeekPrice = BigDecimal.valueOf(125);
            BigDecimal dropInPrice = BigDecimal.valueOf(30);
            ManagedParticipantResponse first = null;

            for (int index = 0; index < sessions.size(); index++) {
                BigDecimal price = "FULL_WEEK".equalsIgnoreCase(packageType)
                        ? (index == 0 ? fullWeekPrice : BigDecimal.ZERO)
                        : dropInPrice;
                var created = registrationService.createPublicEventSessionRegistration(
                        event,
                        sessions.get(index),
                        request,
                        price,
                        packageType);
                if (first == null) {
                    first = ManagedParticipantResponse.builder()
                            .id(created.getId())
                            .participantType("REGISTRATION")
                            .name(created.getParticipantName())
                            .email(created.getGuardianEmail())
                            .createdAt(created.getCreatedAt())
                            .build();
                }
            }

            return first;
        }

        ParticipantAssignmentRequest assignment = new ParticipantAssignmentRequest();
        assignment.setManualName(request.getName());
        assignment.setManualEmail(request.getEmail());
        return addParticipant(eventId, assignment);
    }

    @Transactional
    public void removeParticipant(Long eventId, Long participantId) {
        Registration participant = registrationRepository.findById(participantId)
                .filter(registration -> registration.getEvent() != null && eventId.equals(registration.getEvent().getId()))
                .orElseThrow(() -> new ResourceNotFoundException("EventRegistration", participantId));
        ManagedParticipantResponse participantResponse = toParticipantResponse(participant);
        Event event = getEventEntity(eventId);
        participant.setStatus(RegistrationStatus.CANCELLED);
        participant.setCancelledAt(LocalDateTime.now());
        participant.setCancellationReason("Removed from event roster.");
        registrationRepository.save(participant);
        notifyParticipantAssignment(event, participantResponse, false);
    }

    @Transactional
    public void deleteEvent(Long id) {
        Event event = getEventEntity(id);
        List<Registration> participants = findEventRosterRegistrations(id);
        eventRepository.deleteById(id);
        notifyEventLifecycle(event, participants, "cancelled", "This event has been cancelled and removed.");
    }

    private Event getEventEntity(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
    }

    private EventResponse toResponse(Event event) {
        long participantCount = event.getId() != null
                ? registrationRepository.countByEventIdAndStatusIn(event.getId(), CAPACITY_HOLDING_STATUSES)
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
                .capacity(capacity)
                .participantCount(participantCount)
                .ageGroup(event.getAgeGroup())
                .spotsTotal(capacity)
                .spotsLeft(spotsLeft)
                .price(event.getPrice())
                .status(event.getStatus())
                .type(event.getType())
                .intensity(event.getIntensity())
                .coachName(event.getCoachName())
                .primaryMediaUrl(event.getPrimaryMediaUrl())
                .secondaryMediaUrl(event.getSecondaryMediaUrl())
                .mediaUrls(java.util.stream.Stream.of(event.getPrimaryMediaUrl(), event.getSecondaryMediaUrl())
                        .filter(StringUtils::hasText)
                        .toList())
                .trainingSessions(event.getId() != null
                        ? trainingSessionRepository.findPublicEventSessions(
                                event.getId(),
                                com.kanteelite.training.enums.TrainingSessionStatus.CANCELLED)
                                .stream()
                                .map(trainingSessionService::toResponse)
                                .toList()
                        : List.of())
                .featured(event.isFeatured())
                .active(event.isActive())
                .allowWaitlist(event.isAllowWaitlist())
                .displayOrder(event.getDisplayOrder())
                .build();
    }

    private ManagedParticipantResponse toParticipantResponse(Registration participant) {
        String name = StringUtils.hasText(participant.getParticipantName())
                ? participant.getParticipantName()
                : participant.getGuardianName();
        String email = StringUtils.hasText(participant.getGuardianEmail())
                ? participant.getGuardianEmail()
                : participant.getParticipantEmail();
        return ManagedParticipantResponse.builder()
                .id(participant.getId())
                .participantType("REGISTRATION")
                .name(name)
                .email(email)
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

    private String generateCode() {
        return "REG-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase(Locale.ROOT);
    }

    private boolean existsActiveRegistrationByEmail(Long eventId, String email) {
        if (!StringUtils.hasText(email)) {
            return false;
        }
        return registrationRepository.existsByEventIdAndGuardianEmailIgnoreCaseAndStatusNot(
                eventId,
                email,
                RegistrationStatus.CANCELLED
        );
    }

    private List<Registration> findEventRosterRegistrations(Long eventId) {
        return registrationRepository.findByEventIdOrderByCreatedAtAsc(eventId)
                .stream()
                .filter(registration -> registration.getStatus() != RegistrationStatus.CANCELLED)
                .toList();
    }

    private void notifyEventLifecycle(Event event, String action, String detail) {
        List<Registration> participants = findEventRosterRegistrations(event.getId());
        notifyEventLifecycle(event, participants, action, detail);
    }

    private void notifyEventLifecycle(Event event, List<Registration> participants, String action, String detail) {
        Map<String, String> recipients = new LinkedHashMap<>();
        for (Registration participant : participants) {
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
