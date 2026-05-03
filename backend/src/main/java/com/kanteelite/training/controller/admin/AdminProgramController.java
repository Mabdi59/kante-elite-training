package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.request.ParticipantAssignmentRequest;
import com.kanteelite.training.dto.request.ProgramRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.ManagedParticipantResponse;
import com.kanteelite.training.dto.response.ProgramResponse;
import com.kanteelite.training.dto.response.ProgramWorkflowResponse;
import com.kanteelite.training.service.AuditLogService;
import com.kanteelite.training.service.ProgramService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/programs")
@RequiredArgsConstructor
public class AdminProgramController {

    private final ProgramService programService;
    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProgramResponse>>> getAllPrograms() {
        return ResponseEntity.ok(ApiResponse.success(programService.getAllPrograms()));
    }

    @GetMapping("/{id}/workflow")
    public ResponseEntity<ApiResponse<ProgramWorkflowResponse>> getProgramWorkflow(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(programService.getProgramWorkflow(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProgramResponse>> createProgram(
            @Valid @RequestBody ProgramRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        ProgramResponse created = programService.createProgram(request);
        String actor = principal != null ? principal.getUsername() : "admin";
        auditLogService.log(actor, "CREATE", "Program", created.getId(), "Created program: " + created.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Program created.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProgramResponse>> updateProgram(
            @PathVariable Long id, @Valid @RequestBody ProgramRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        ProgramResponse updated = programService.updateProgram(id, request);
        String actor = principal != null ? principal.getUsername() : "admin";
        auditLogService.log(actor, "UPDATE", "Program", id, "Updated program: " + updated.getName());
        return ResponseEntity.ok(ApiResponse.success("Program updated.", updated));
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
        ManagedParticipantResponse created = programService.addParticipant(id, request);
        String actor = principal != null ? principal.getUsername() : "admin";
        auditLogService.log(actor, "CREATE", "ProgramRegistration", created.getId(),
                "Added roster registration to program #" + id);
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
        programService.removeParticipant(id, registrationId);
        String actor = principal != null ? principal.getUsername() : "admin";
        auditLogService.log(actor, "DELETE", "ProgramRegistration", registrationId,
                "Removed roster registration from program #" + id);
        return ResponseEntity.ok(ApiResponse.success("Roster registration removed.", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProgram(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        String actor = principal != null ? principal.getUsername() : "admin";
        programService.deleteProgram(id);
        auditLogService.log(actor, "DELETE", "Program", id, "Deleted program #" + id);
        return ResponseEntity.ok(ApiResponse.success("Program deleted.", null));
    }
}
