package com.kanteelite.training.controller;

import jakarta.validation.Valid;
import com.kanteelite.training.dto.request.ProgramEnrollmentRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.ProgramEnrollmentResponse;
import com.kanteelite.training.enums.EnrollmentStatus;
import com.kanteelite.training.enums.PaymentStatus;
import com.kanteelite.training.service.ProgramEnrollmentService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ProgramEnrollmentController {

    private final ProgramEnrollmentService enrollmentService;

    @PostMapping("/api/enrollments")
    public ResponseEntity<ApiResponse<ProgramEnrollmentResponse>> enroll(
            @Valid @RequestBody ProgramEnrollmentRequest request,
            @AuthenticationPrincipal UserDetails user) {
        if (request.getPlayerEmail() == null) {
            request.setPlayerEmail(user.getUsername());
        }
        return ResponseEntity.ok(ApiResponse.success(enrollmentService.enroll(request, user.getUsername())));
    }

    @GetMapping("/api/enrollments/my")
    public ResponseEntity<ApiResponse<List<ProgramEnrollmentResponse>>> getMyEnrollments(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(enrollmentService.getEnrollmentsForPlayer(user.getUsername())));
    }

    @GetMapping("/api/admin/enrollments")
    public ResponseEntity<ApiResponse<List<ProgramEnrollmentResponse>>> getAllEnrollments() {
        return ResponseEntity.ok(ApiResponse.success(enrollmentService.getAllEnrollments()));
    }

    @PostMapping("/api/admin/enrollments")
    public ResponseEntity<ApiResponse<ProgramEnrollmentResponse>> createEnrollment(
            @Valid @RequestBody ProgramEnrollmentRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(enrollmentService.createAdminEnrollment(request, user.getUsername())));
    }

    @GetMapping("/api/admin/enrollments/program/{programId}")
    public ResponseEntity<ApiResponse<List<ProgramEnrollmentResponse>>> getByProgram(@PathVariable Long programId) {
        return ResponseEntity.ok(ApiResponse.success(enrollmentService.getEnrollmentsForProgram(programId)));
    }

    @GetMapping("/api/admin/enrollments/player/{email}")
    public ResponseEntity<ApiResponse<List<ProgramEnrollmentResponse>>> getByPlayer(@PathVariable String email) {
        return ResponseEntity.ok(ApiResponse.success(enrollmentService.getEnrollmentsForPlayer(email)));
    }

    @PatchMapping("/api/admin/enrollments/{id}/status")
    public ResponseEntity<ApiResponse<ProgramEnrollmentResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam EnrollmentStatus status,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(enrollmentService.updateStatus(id, status, user.getUsername())));
    }

    @PatchMapping("/api/admin/enrollments/{id}/payment")
    public ResponseEntity<ApiResponse<ProgramEnrollmentResponse>> updatePayment(
            @PathVariable Long id,
            @RequestParam PaymentStatus paymentStatus,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(enrollmentService.updatePaymentStatus(id, paymentStatus, user.getUsername())));
    }

    @PutMapping("/api/admin/enrollments/{id}")
    public ResponseEntity<ApiResponse<ProgramEnrollmentResponse>> updateEnrollment(
            @PathVariable Long id,
            @Valid @RequestBody ProgramEnrollmentRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(enrollmentService.updateEnrollment(id, request, user.getUsername())));
    }

    @DeleteMapping("/api/admin/enrollments/{id}")
    public ResponseEntity<Void> deleteEnrollment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        enrollmentService.deleteEnrollment(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/admin/enrollments/export.csv")
    public void exportCsv(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"enrollments.csv\"");
        List<ProgramEnrollmentResponse> enrollments = enrollmentService.getAllEnrollments();
        try (PrintWriter writer = response.getWriter()) {
            writer.println("ID,Player Email,Player Name,Parent Email,Program,Status,Payment,Schedule,Start Date,End Date,Enrolled By,Created At");
            for (ProgramEnrollmentResponse e : enrollments) {
                writer.printf("%d,\"%s\",\"%s\",\"%s\",\"%s\",%s,%s,%s,%s,%s,\"%s\",%s%n",
                        e.getId(),
                        escapeCsv(e.getPlayerEmail()),
                        escapeCsv(e.getPlayerName()),
                        escapeCsv(e.getParentEmail()),
                        escapeCsv(e.getProgramName()),
                        e.getStatus(),
                        e.getPaymentStatus(),
                        e.getScheduleType(),
                        e.getStartDate(),
                        e.getEndDate(),
                        escapeCsv(e.getEnrolledBy()),
                        e.getCreatedAt()
                );
            }
        }
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        String trimmed = value.trim();
        if (!trimmed.isEmpty() && (trimmed.charAt(0) == '=' || trimmed.charAt(0) == '+'
                || trimmed.charAt(0) == '-' || trimmed.charAt(0) == '@')) {
            value = "'" + trimmed;
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
