package com.kanteelite.training.controller;

import com.kanteelite.training.dto.request.CalendarEventRequest;
import com.kanteelite.training.dto.response.CalendarEventResponse;
import com.kanteelite.training.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping
    public ResponseEntity<List<CalendarEventResponse>> getMyEvents(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(calendarService.getEventsForUser(user.getUsername(), from, to));
    }

    @GetMapping("/all")
    public ResponseEntity<List<CalendarEventResponse>> getAllEvents(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(calendarService.getAllEvents(from, to));
    }

    @PostMapping
    public ResponseEntity<CalendarEventResponse> createEvent(
            @RequestBody CalendarEventRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(calendarService.createEvent(request, user.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        calendarService.deleteEvent(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }
}
