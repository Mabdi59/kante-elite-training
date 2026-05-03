package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.request.CancelRegistrationRequest;
import com.kanteelite.training.dto.request.RegistrationRequest;
import com.kanteelite.training.dto.request.RegistrationStatusRequest;
import com.kanteelite.training.dto.request.RescheduleRegistrationRequest;
import com.kanteelite.training.dto.request.UnifiedRegistrationPaymentStatusRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.RegistrationResponse;
import com.kanteelite.training.enums.RegistrationActorType;
import com.kanteelite.training.enums.RegistrationOfferingType;
import com.kanteelite.training.enums.RegistrationPaymentStatus;
import com.kanteelite.training.enums.RegistrationStatus;
import com.kanteelite.training.service.RegistrationService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/registrations")
@RequiredArgsConstructor
public class AdminRegistrationController {

    private final RegistrationService registrationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RegistrationResponse>>> getRegistrations(
            @RequestParam(required = false) RegistrationOfferingType offeringType,
            @RequestParam(required = false) RegistrationStatus status,
            @RequestParam(required = false) RegistrationPaymentStatus paymentStatus,
            @RequestParam(required = false) Long programId,
            @RequestParam(required = false) Long eventId,
            @RequestParam(required = false) LocalDate scheduledDate) {
        return ResponseEntity.ok(ApiResponse.success(
                registrationService.getAllRegistrations(offeringType, status, paymentStatus, programId, eventId, scheduledDate)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RegistrationResponse>> getRegistration(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(registrationService.getRegistration(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RegistrationResponse>> createRegistration(
            @Valid @RequestBody RegistrationRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        RegistrationResponse created = registrationService.createAdminRegistration(request, actor(principal));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration created.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RegistrationResponse>> updateRegistration(
            @PathVariable Long id,
            @Valid @RequestBody RegistrationRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Registration updated.",
                registrationService.updateAdminRegistration(id, request, actor(principal))));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<RegistrationResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody RegistrationStatusRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Registration status updated.",
                registrationService.updateStatus(id, request.getStatus(), actor(principal))));
    }

    @PatchMapping("/{id}/payment-status")
    public ResponseEntity<ApiResponse<RegistrationResponse>> updatePaymentStatus(
            @PathVariable Long id,
            @Valid @RequestBody UnifiedRegistrationPaymentStatusRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Payment status updated.",
                registrationService.updatePaymentStatus(id, request.getPaymentStatus(), actor(principal))));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<RegistrationResponse>> cancelRegistration(
            @PathVariable Long id,
            @Valid @RequestBody CancelRegistrationRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Registration cancelled.",
                registrationService.cancelRegistration(id, request.getReason(), actor(principal), RegistrationActorType.ADMIN)));
    }

    @PatchMapping("/{id}/reschedule")
    public ResponseEntity<ApiResponse<RegistrationResponse>> reschedule(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRegistrationRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Registration rescheduled.",
                registrationService.reschedule(id, request, actor(principal))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRegistration(@PathVariable Long id) {
        registrationService.deleteAdminRegistration(id);
        return ResponseEntity.ok(ApiResponse.success("Registration deleted.", null));
    }

    @GetMapping("/export.csv")
    public void exportCsv(
            @RequestParam(required = false) RegistrationOfferingType offeringType,
            @RequestParam(required = false) RegistrationStatus status,
            @RequestParam(required = false) RegistrationPaymentStatus paymentStatus,
            @RequestParam(required = false) Long programId,
            @RequestParam(required = false) Long eventId,
            @RequestParam(required = false) LocalDate scheduledDate,
            HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"registrations.csv\"");

        List<RegistrationResponse> registrations = registrationService.getAllRegistrations(
                offeringType, status, paymentStatus, programId, eventId, scheduledDate);

        try (PrintWriter writer = response.getWriter()) {
            writer.println("ID,Code,Type,Offering,Participant,Guardian Email,Guardian Phone,Status,Payment Status,Scheduled Date,Scheduled Time,Created At");
            for (RegistrationResponse r : registrations) {
                writer.printf("%d,%s,%s,\"%s\",\"%s\",\"%s\",\"%s\",%s,%s,%s,%s,%s%n",
                        r.getId(),
                        escape(r.getRegistrationCode()),
                        r.getOfferingType(),
                        escape(r.getProgramName() != null ? r.getProgramName() : r.getEventTitle()),
                        escape(r.getParticipantName()),
                        escape(r.getGuardianEmail()),
                        escape(r.getGuardianPhone()),
                        r.getStatus(),
                        r.getPaymentStatus(),
                        r.getScheduledDate() != null ? r.getScheduledDate() : "",
                        escape(r.getScheduledStartTime()),
                        r.getCreatedAt());
            }
        }
    }

    private String actor(UserDetails principal) {
        return principal != null ? principal.getUsername() : "admin";
    }

    private String escape(String value) {
        if (value == null) return "";
        String trimmed = value.trim();
        if (!trimmed.isEmpty() && (trimmed.charAt(0) == '=' || trimmed.charAt(0) == '+'
                || trimmed.charAt(0) == '-' || trimmed.charAt(0) == '@')) {
            value = "'" + trimmed;
        }
        return value.replace("\"", "\"\"");
    }
}
