package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.ProgramEnrollmentRequest;
import com.kanteelite.training.dto.response.ProgramEnrollmentResponse;
import com.kanteelite.training.entity.Program;
import com.kanteelite.training.entity.ProgramEnrollment;
import com.kanteelite.training.enums.EnrollmentStatus;
import com.kanteelite.training.enums.PaymentStatus;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.ProgramEnrollmentRepository;
import com.kanteelite.training.repository.ProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProgramEnrollmentService {

    private final ProgramEnrollmentRepository enrollmentRepository;
    private final ProgramRepository programRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Transactional
    public ProgramEnrollmentResponse enroll(ProgramEnrollmentRequest request, String enrolledBy) {
        Program program = programRepository.findById(request.getProgramId())
                .orElseThrow(() -> new ResourceNotFoundException("Program", request.getProgramId()));

        if (enrollmentRepository.existsByProgramIdAndPlayerEmailIgnoreCase(
                request.getProgramId(), request.getPlayerEmail())) {
            throw new IllegalArgumentException("Player is already enrolled in this program.");
        }

        ProgramEnrollment enrollment = ProgramEnrollment.builder()
                .program(program)
                .playerEmail(request.getPlayerEmail().trim().toLowerCase())
                .playerName(request.getPlayerName())
                .parentEmail(request.getParentEmail())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .scheduleType(request.getScheduleType())
                .notes(request.getNotes())
                .enrolledBy(enrolledBy)
                .build();

        ProgramEnrollment saved = enrollmentRepository.save(enrollment);
        auditLogService.log(enrolledBy, "ENROLL", "ProgramEnrollment", saved.getId(),
                "Enrolled " + request.getPlayerEmail() + " in " + program.getName());
        notificationService.send(request.getPlayerEmail(), "ENROLLMENT",
                "Enrollment Confirmed", "You have been enrolled in " + program.getName(),
                "Program", program.getId());
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
        return enrollmentRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public ProgramEnrollmentResponse updateStatus(Long id, EnrollmentStatus status, String actorEmail) {
        ProgramEnrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProgramEnrollment", id));
        enrollment.setStatus(status);
        ProgramEnrollment saved = enrollmentRepository.save(enrollment);
        auditLogService.log(actorEmail, "UPDATE_STATUS", "ProgramEnrollment", id, "Status -> " + status);
        return toResponse(saved);
    }

    @Transactional
    public ProgramEnrollmentResponse updatePaymentStatus(Long id, PaymentStatus paymentStatus, String actorEmail) {
        ProgramEnrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProgramEnrollment", id));
        enrollment.setPaymentStatus(paymentStatus);
        ProgramEnrollment saved = enrollmentRepository.save(enrollment);
        auditLogService.log(actorEmail, "UPDATE_PAYMENT", "ProgramEnrollment", id, "Payment -> " + paymentStatus);
        return toResponse(saved);
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
}
