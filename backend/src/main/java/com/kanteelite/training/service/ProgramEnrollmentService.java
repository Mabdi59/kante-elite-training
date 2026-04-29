package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.ProgramEnrollmentRequest;
import com.kanteelite.training.dto.response.ProgramEnrollmentResponse;
import com.kanteelite.training.entity.Program;
import com.kanteelite.training.entity.ProgramEnrollment;
import com.kanteelite.training.enums.EnrollmentStatus;
import com.kanteelite.training.enums.PaymentStatus;
import com.kanteelite.training.enums.ScheduleType;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.ProgramEnrollmentRepository;
import com.kanteelite.training.repository.ProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ProgramEnrollmentService {

    private final ProgramEnrollmentRepository enrollmentRepository;
    private final ProgramRepository programRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Transactional
    public ProgramEnrollmentResponse enroll(ProgramEnrollmentRequest request, String enrolledBy) {
        Program program = programRepository.findById(request.getProgramId())
                .orElseThrow(() -> new ResourceNotFoundException("Program", request.getProgramId()));
        validateDuplicateEnrollment(request.getProgramId(), request.getPlayerEmail(), null);

        ProgramEnrollment enrollment = ProgramEnrollment.builder()
                .build();
        applyEnrollmentDetails(enrollment, request, enrolledBy);

        ProgramEnrollment saved = enrollmentRepository.save(enrollment);
        auditLogService.log(enrolledBy, "ENROLL", "ProgramEnrollment", saved.getId(),
                "Enrolled " + request.getPlayerEmail() + " in " + program.getName());
        String recipientEmail = resolveRecipientEmail(saved);
        notificationService.send(recipientEmail, "ENROLLMENT",
                "Enrollment Confirmed", "You have been enrolled in " + program.getName(),
                "Program", program.getId());
        emailService.sendEnrollmentCreatedEmail(
                recipientEmail,
                saved.getPlayerName() != null ? saved.getPlayerName() : saved.getPlayerEmail(),
                saved.getProgram().getName());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProgramEnrollmentResponse> getEnrollmentsForPlayer(String playerEmail) {
        return enrollmentRepository.findByPlayerEmailIgnoreCaseOrderByCreatedAtDesc(playerEmail).stream()
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ProgramEnrollmentResponse> getEnrollmentsForProgram(Long programId) {
        return enrollmentRepository.findByProgramIdOrderByCreatedAtDesc(programId).stream()
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ProgramEnrollmentResponse> getAllEnrollments() {
        return enrollmentRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ProgramEnrollmentResponse updateStatus(Long id, EnrollmentStatus status, String actorEmail) {
        ProgramEnrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProgramEnrollment", id));
        enrollment.setStatus(status);
        ProgramEnrollment saved = enrollmentRepository.save(enrollment);
        auditLogService.log(actorEmail, "UPDATE_STATUS", "ProgramEnrollment", id, "Status -> " + status);
        String recipientEmail = resolveRecipientEmail(saved);
        notificationService.send(
                recipientEmail,
                "ENROLLMENT_STATUS",
                "Enrollment status updated",
                "Enrollment status for " + saved.getProgram().getName() + " is now " + status.name().toLowerCase(Locale.ROOT) + ".",
                "ProgramEnrollment",
                saved.getId());
        emailService.sendEnrollmentStatusEmail(
                recipientEmail,
                saved.getPlayerName() != null ? saved.getPlayerName() : saved.getPlayerEmail(),
                saved.getProgram().getName(),
                status.name());
        return toResponse(saved);
    }

    @Transactional
    public ProgramEnrollmentResponse updatePaymentStatus(Long id, PaymentStatus paymentStatus, String actorEmail) {
        ProgramEnrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProgramEnrollment", id));
        enrollment.setPaymentStatus(paymentStatus);
        ProgramEnrollment saved = enrollmentRepository.save(enrollment);
        auditLogService.log(actorEmail, "UPDATE_PAYMENT", "ProgramEnrollment", id, "Payment -> " + paymentStatus);
        String recipientEmail = resolveRecipientEmail(saved);
        notificationService.send(
                recipientEmail,
                "ENROLLMENT_PAYMENT",
                "Payment status updated",
                "Payment status for " + saved.getProgram().getName() + " is now " + paymentStatus.name().toLowerCase(Locale.ROOT) + ".",
                "ProgramEnrollment",
                saved.getId());
        emailService.sendEnrollmentPaymentStatusEmail(
                recipientEmail,
                saved.getPlayerName() != null ? saved.getPlayerName() : saved.getPlayerEmail(),
                saved.getProgram().getName(),
                paymentStatus.name());
        return toResponse(saved);
    }

    @Transactional
    public ProgramEnrollmentResponse updateEnrollment(Long id, ProgramEnrollmentRequest request, String actorEmail) {
        ProgramEnrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProgramEnrollment", id));
        validateDuplicateEnrollment(request.getProgramId(), request.getPlayerEmail(), id);
        applyEnrollmentDetails(enrollment, request, enrollment.getEnrolledBy());
        ProgramEnrollment saved = enrollmentRepository.save(enrollment);
        auditLogService.log(actorEmail, "UPDATE", "ProgramEnrollment", id,
                "Updated enrollment for " + saved.getPlayerEmail() + " in " + saved.getProgram().getName());
        return toResponse(saved);
    }

    @Transactional
    public ProgramEnrollmentResponse createAdminEnrollment(ProgramEnrollmentRequest request, String actorEmail) {
        return enroll(request, actorEmail);
    }

    @Transactional
    public void deleteEnrollment(Long id, String actorEmail) {
        ProgramEnrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProgramEnrollment", id));
        enrollmentRepository.delete(enrollment);
        auditLogService.log(actorEmail, "DELETE", "ProgramEnrollment", id,
                "Deleted enrollment for " + enrollment.getPlayerEmail() + " in " + enrollment.getProgram().getName());
    }

    public ProgramEnrollmentResponse toResponse(ProgramEnrollment e) {
        return ProgramEnrollmentResponse.builder()
                .id(e.getId())
                .programId(e.getProgram().getId())
                .programName(e.getProgram().getName())
                .playerEmail(e.getPlayerEmail())
                .playerName(e.getPlayerName())
                .parentEmail(e.getParentEmail())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .status(e.getStatus())
                .scheduleType(e.getScheduleType())
                .paymentStatus(e.getPaymentStatus())
                .notes(e.getNotes())
                .enrolledBy(e.getEnrolledBy())
                .createdAt(e.getCreatedAt())
                .build();
    }

    private void applyEnrollmentDetails(ProgramEnrollment enrollment, ProgramEnrollmentRequest request, String enrolledBy) {
        Program program = programRepository.findById(request.getProgramId())
                .orElseThrow(() -> new ResourceNotFoundException("Program", request.getProgramId()));
        enrollment.setProgram(program);
        enrollment.setPlayerEmail(normalizeEmail(request.getPlayerEmail()));
        enrollment.setPlayerName(request.getPlayerName());
        enrollment.setParentEmail(normalizeEmail(request.getParentEmail()));
        enrollment.setStartDate(request.getStartDate());
        enrollment.setEndDate(request.getEndDate());
        enrollment.setScheduleType(request.getScheduleType() == null ? ScheduleType.ONE_TIME : request.getScheduleType());
        enrollment.setNotes(request.getNotes());
        enrollment.setEnrolledBy(enrolledBy);
    }

    private void validateDuplicateEnrollment(Long programId, String playerEmail, Long currentEnrollmentId) {
        enrollmentRepository.findByProgramIdAndPlayerEmailIgnoreCase(programId, playerEmail)
                .filter(existing -> currentEnrollmentId == null || !existing.getId().equals(currentEnrollmentId))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Player is already enrolled in this program.");
                });
    }

    private String normalizeEmail(String email) {
        return email == null || email.isBlank() ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private String resolveRecipientEmail(ProgramEnrollment enrollment) {
        return enrollment.getParentEmail() != null ? enrollment.getParentEmail() : enrollment.getPlayerEmail();
    }
}
