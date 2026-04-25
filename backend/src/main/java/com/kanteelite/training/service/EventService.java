package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.EventRequest;
import com.kanteelite.training.dto.request.ParticipantAssignmentRequest;
import com.kanteelite.training.dto.response.EventResponse;
import com.kanteelite.training.dto.response.EventWorkflowResponse;
import com.kanteelite.training.dto.response.ManagedParticipantResponse;
import com.kanteelite.training.entity.Event;
import com.kanteelite.training.entity.EventParticipant;
import com.kanteelite.training.entity.PlayerProfile;
import com.kanteelite.training.entity.User;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.EventParticipantRepository;
import com.kanteelite.training.repository.EventRepository;
import com.kanteelite.training.repository.PlayerProfileRepository;
import com.kanteelite.training.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class EventService {

    private static final List<String> ALLOWED_STATUSES = List.of("UPCOMING", "ACTIVE", "COMPLETED");

    private final EventRepository eventRepository;
    private final EventParticipantRepository eventParticipantRepository;
    private final UserRepository userRepository;
    private final PlayerProfileRepository playerProfileRepository;

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
                .capacity(resolveCapacity(req))
                .ageGroup(req.getAgeGroup())
                .spotsTotal(resolveCapacity(req))
                .spotsLeft(resolveCapacity(req))
                .price(req.getPrice())
                .status(normalizeStatus(req.getStatus()))
                .type(req.getType())
                .intensity(req.getIntensity())
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
        if (req.getDisplayOrder() != null) event.setDisplayOrder(req.getDisplayOrder());
        return toResponse(eventRepository.save(event));
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
            participant.setManualName(manualName);
            participant.setManualEmail(manualEmail);
        }

        return toParticipantResponse(eventParticipantRepository.save(participant));
    }

    @Transactional
    public void removeParticipant(Long eventId, Long participantId) {
        EventParticipant participant = eventParticipantRepository.findByIdAndEventId(participantId, eventId)
                .orElseThrow(() -> new ResourceNotFoundException("EventParticipant", participantId));
        eventParticipantRepository.delete(participant);
    }

    @Transactional
    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new ResourceNotFoundException("Event", id);
        }
        eventRepository.deleteById(id);
    }

    private Event getEventEntity(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
    }

    private EventResponse toResponse(Event event) {
        long participantCount = event.getId() != null
                ? eventParticipantRepository.countByEventId(event.getId())
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
                .displayOrder(event.getDisplayOrder())
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
}
