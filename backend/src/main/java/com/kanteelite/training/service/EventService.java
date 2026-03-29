package com.kanteelite.training.service;

import com.kanteelite.training.dto.response.EventResponse;
import com.kanteelite.training.entity.Event;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

    public EventResponse getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
        return toResponse(event);
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
