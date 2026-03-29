package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.request.EventRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.EventResponse;
import com.kanteelite.training.service.AuditLogService;
import com.kanteelite.training.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/events")
@RequiredArgsConstructor
public class AdminEventController {

    private final EventService eventService;
    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllEvents() {
        return ResponseEntity.ok(ApiResponse.success(eventService.getAllEvents()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(
            @Valid @RequestBody EventRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        EventResponse created = eventService.createEvent(request);
        String actor = principal != null ? principal.getUsername() : "admin";
        auditLogService.log(actor, "CREATE", "Event", created.getId(), "Created event: " + created.getTitle());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Event created.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(
            @PathVariable Long id, @Valid @RequestBody EventRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        EventResponse updated = eventService.updateEvent(id, request);
        String actor = principal != null ? principal.getUsername() : "admin";
        auditLogService.log(actor, "UPDATE", "Event", id, "Updated event: " + updated.getTitle());
        return ResponseEntity.ok(ApiResponse.success("Event updated.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        String actor = principal != null ? principal.getUsername() : "admin";
        eventService.deleteEvent(id);
        auditLogService.log(actor, "DELETE", "Event", id, "Deleted event #" + id);
        return ResponseEntity.ok(ApiResponse.success("Event deleted.", null));
    }
}
