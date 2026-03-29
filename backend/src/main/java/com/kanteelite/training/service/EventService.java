package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.EventRequest;
import com.kanteelite.training.dto.response.EventResponse;
import com.kanteelite.training.entity.Event;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    public List<EventResponse> getUpcomingEvents() {
        return eventRepository.findByStartDateGreaterThanEqualOrderByStartDateAsc(LocalDate.now())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public EventResponse getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
        return toResponse(event);
    }

    @Transactional
    public EventResponse createEvent(EventRequest req) {
        Event e = Event.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .location(req.getLocation())
                .venue(req.getVenue())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .ageGroup(req.getAgeGroup())
                .spotsTotal(req.getSpotsTotal())
                .spotsLeft(req.getSpotsLeft())
                .price(req.getPrice())
                .status(req.getStatus() != null ? req.getStatus() : "OPEN")
                .type(req.getType())
                .intensity(req.getIntensity())
                .displayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0)
                .build();
        return toResponse(eventRepository.save(e));
    }

    @Transactional
    public EventResponse updateEvent(Long id, EventRequest req) {
        Event e = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
        e.setTitle(req.getTitle());
        e.setDescription(req.getDescription());
        e.setLocation(req.getLocation());
        e.setVenue(req.getVenue());
        e.setStartDate(req.getStartDate());
        e.setEndDate(req.getEndDate());
        e.setAgeGroup(req.getAgeGroup());
        e.setSpotsTotal(req.getSpotsTotal());
        e.setSpotsLeft(req.getSpotsLeft());
        e.setPrice(req.getPrice());
        if (req.getStatus() != null) e.setStatus(req.getStatus());
        e.setType(req.getType());
        e.setIntensity(req.getIntensity());
        if (req.getDisplayOrder() != null) e.setDisplayOrder(req.getDisplayOrder());
        return toResponse(eventRepository.save(e));
    }

    @Transactional
    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new ResourceNotFoundException("Event", id);
        }
        eventRepository.deleteById(id);
    }

    private EventResponse toResponse(Event e) {
        return EventResponse.builder()
                .id(e.getId())
                .title(e.getTitle())
                .description(e.getDescription())
                .location(e.getLocation())
                .venue(e.getVenue())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .ageGroup(e.getAgeGroup())
                .spotsTotal(e.getSpotsTotal())
                .spotsLeft(e.getSpotsLeft())
                .price(e.getPrice())
                .status(e.getStatus())
                .type(e.getType())
                .intensity(e.getIntensity())
                .displayOrder(e.getDisplayOrder())
                .build();
    }
}
