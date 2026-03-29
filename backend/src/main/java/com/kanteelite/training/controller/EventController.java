package com.kanteelite.training.controller;

import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.EventResponse;
import com.kanteelite.training.service.EventService;
import lombok.RequiredArgsConstructor;
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
}
