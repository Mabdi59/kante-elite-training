package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.request.EventRequest;
import com.kanteelite.training.dto.request.ParticipantAssignmentRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.EventResponse;
import com.kanteelite.training.dto.response.EventWorkflowResponse;
import com.kanteelite.training.dto.response.ManagedParticipantResponse;
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

    @GetMapping("/{id}/workflow")
    public ResponseEntity<ApiResponse<EventWorkflowResponse>> getEventWorkflow(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(eventService.getEventWorkflow(id)));
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

    @PostMapping("/{id}/participants")
    public ResponseEntity<ApiResponse<ManagedParticipantResponse>> addRosterRegistrationViaParticipantPath(
            @PathVariable Long id,
            @RequestBody ParticipantAssignmentRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        return addRosterRegistration(id, request, principal);
    }

    @PostMapping("/{id}/registrations")
    public ResponseEntity<ApiResponse<ManagedParticipantResponse>> addRosterRegistration(
            @PathVariable Long id,
            @RequestBody ParticipantAssignmentRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        ManagedParticipantResponse created = eventService.addParticipant(id, request);
        String actor = principal != null ? principal.getUsername() : "admin";
        auditLogService.log(actor, "CREATE", "EventRegistration", created.getId(),
                "Added roster registration to event #" + id);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Roster registration added.", created));
    }

    @DeleteMapping("/{id}/participants/{participantId}")
    public ResponseEntity<ApiResponse<Void>> removeRosterRegistrationViaParticipantPath(
            @PathVariable Long id,
            @PathVariable Long participantId,
            @AuthenticationPrincipal UserDetails principal) {
        return removeRosterRegistration(id, participantId, principal);
    }

    @DeleteMapping("/{id}/registrations/{registrationId}")
    public ResponseEntity<ApiResponse<Void>> removeRosterRegistration(
            @PathVariable Long id,
            @PathVariable Long registrationId,
            @AuthenticationPrincipal UserDetails principal) {
        eventService.removeParticipant(id, registrationId);
        String actor = principal != null ? principal.getUsername() : "admin";
        auditLogService.log(actor, "DELETE", "EventRegistration", registrationId,
                "Removed roster registration from event #" + id);
        return ResponseEntity.ok(ApiResponse.success("Roster registration removed.", null));
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
