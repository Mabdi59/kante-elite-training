package com.kanteelite.training.controller;

import com.kanteelite.training.dto.request.EventParticipationRequest;
import com.kanteelite.training.dto.request.SimpleEventRegistrationRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.EventResponse;
import com.kanteelite.training.dto.response.ManagedParticipantResponse;
import com.kanteelite.training.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> getUpcomingEvents() {
        return ResponseEntity.ok(ApiResponse.success(eventService.getUpcomingEvents()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(eventService.getEventById(id)));
    }

    /**
     * Simple direct registration to an event - just name and email.
     * No approval needed, instant registration.
     */
    @PostMapping("/{id}/register")
    public ResponseEntity<ApiResponse<ManagedParticipantResponse>> registerForEvent(
            @PathVariable Long id,
            @Valid @RequestBody SimpleEventRegistrationRequest request) {
        ManagedParticipantResponse created = eventService.registerForEvent(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("You've been registered for this event! Check your email for confirmation.", created));
    }

    @PostMapping("/{id}/requests")
    public ResponseEntity<ApiResponse<ManagedParticipantResponse>> requestParticipation(
            @PathVariable Long id,
            @Valid @RequestBody EventParticipationRequest request) {
        ManagedParticipantResponse created = eventService.requestParticipation(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Event request submitted.", created));
    }
}
