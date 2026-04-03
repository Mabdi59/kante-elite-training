package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.CalendarEventRequest;
import com.kanteelite.training.dto.response.CalendarEventResponse;
import com.kanteelite.training.entity.Booking;
import com.kanteelite.training.entity.CalendarEvent;
import com.kanteelite.training.enums.CalendarEventType;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.BookingRepository;
import com.kanteelite.training.repository.CalendarEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final CalendarEventRepository calendarEventRepository;
    private final BookingRepository bookingRepository;

    @Transactional(readOnly = true)
    public List<CalendarEventResponse> getEventsForUser(String email, LocalDateTime from, LocalDateTime to) {
        List<CalendarEventResponse> events = new ArrayList<>();

        events.addAll(calendarEventRepository.findByDateRangeAndOptionalOwner(from, to, email)
                .stream().map(this::toResponse).toList());

        if (email != null) {
            bookingRepository.findByEmailIgnoreCaseOrderByCreatedAtDesc(email).stream()
                    .filter(b -> {
                        LocalDateTime bookingStart = b.getBookingDate().atStartOfDay();
                        return !bookingStart.isBefore(from) && !bookingStart.isAfter(to);
                    })
                    .map(this::bookingToCalendarEvent)
                    .forEach(events::add);
        }

        events.sort(Comparator.comparing(CalendarEventResponse::getStartAt));
        return events;
    }

    @Transactional(readOnly = true)
    public List<CalendarEventResponse> getAllEvents(LocalDateTime from, LocalDateTime to) {
        return calendarEventRepository.findByStartAtBetweenOrderByStartAt(from, to).stream()
                .map(this::toResponse).toList();
    }

    @Transactional
    public CalendarEventResponse createEvent(CalendarEventRequest request, String creatorEmail) {
        CalendarEvent event = CalendarEvent.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .eventType(request.getEventType())
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .location(request.getLocation())
                .ownerEmail(request.getOwnerEmail() != null ? request.getOwnerEmail() : creatorEmail)
                .allDay(request.isAllDay())
                .color(request.getColor())
                .build();
        return toResponse(calendarEventRepository.save(event));
    }

    @Transactional
    public void deleteEvent(Long id, String actorEmail) {
        CalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CalendarEvent", id));
        calendarEventRepository.delete(event);
    }

    private CalendarEventResponse bookingToCalendarEvent(Booking b) {
        LocalDateTime start = b.getBookingDate().atStartOfDay();
        return CalendarEventResponse.builder()
                .id(b.getId())
                .title(b.getProgram().getName() + " – " + b.getPlayerName())
                .description("Booking for " + b.getPlayerName())
                .eventType(CalendarEventType.BOOKING)
                .startAt(start)
                .endAt(start.plusHours(1))
                .ownerEmail(b.getEmail())
                .entityType("Booking")
                .entityId(b.getId())
                .allDay(false)
                .color("#22c55e")
                .build();
    }

    public CalendarEventResponse toResponse(CalendarEvent e) {
        return CalendarEventResponse.builder()
                .id(e.getId())
                .title(e.getTitle())
                .description(e.getDescription())
                .eventType(e.getEventType())
                .startAt(e.getStartAt())
                .endAt(e.getEndAt())
                .location(e.getLocation())
                .ownerEmail(e.getOwnerEmail())
                .entityType(e.getEntityType())
                .entityId(e.getEntityId())
                .allDay(e.isAllDay())
                .color(e.getColor())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
