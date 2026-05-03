package com.kanteelite.training.service;

import com.kanteelite.training.dto.response.RegistrationResponse;
import com.kanteelite.training.dto.response.TrainingSessionResponse;
import com.kanteelite.training.entity.Event;
import com.kanteelite.training.entity.Program;
import com.kanteelite.training.entity.Registration;
import com.kanteelite.training.entity.TrainingSession;
import com.kanteelite.training.entity.User;
import com.kanteelite.training.enums.RegistrationStatus;
import com.kanteelite.training.enums.TrainingSessionStatus;
import com.kanteelite.training.repository.RegistrationRepository;
import com.kanteelite.training.repository.TrainingSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TrainingSessionService {

    private static final Set<RegistrationStatus> ACTIVE_ROSTER_STATUSES = Set.of(
            RegistrationStatus.PENDING,
            RegistrationStatus.CONFIRMED,
            RegistrationStatus.WAITLISTED
    );

    private final TrainingSessionRepository trainingSessionRepository;
    private final RegistrationRepository registrationRepository;

    @Transactional
    public TrainingSession findOrCreateSession(
            Program program,
            LocalDate scheduledDate,
            String startTime,
            Integer capacity
    ) {
        return trainingSessionRepository
                .findFirstByProgramIdAndScheduledDateAndStartTimeAndStatusNotOrderByCreatedAtAsc(
                        program.getId(), scheduledDate, startTime, TrainingSessionStatus.CANCELLED)
                .orElseGet(() -> trainingSessionRepository.save(TrainingSession.builder()
                        .program(program)
                        .scheduledDate(scheduledDate)
                        .startTime(startTime)
                        .timezone("America/Chicago")
                        .location(program.getLocation())
                        .capacity(resolveCapacity(capacity))
                        .status(TrainingSessionStatus.SCHEDULED)
                        .build()));
    }

    private int resolveCapacity(Integer capacity) {
        return capacity != null && capacity > 0 ? capacity : 1;
    }

    public TrainingSessionResponse toResponse(TrainingSession session) {
        List<Registration> roster = registrationRepository.findByTrainingSessionIdOrderByCreatedAtAsc(session.getId());
        Program program = session.getProgram();
        Event event = session.getEvent();
        User coach = session.getCoachUser();
        return TrainingSessionResponse.builder()
                .id(session.getId())
                .programId(program != null ? program.getId() : null)
                .programName(program != null ? program.getName() : null)
                .programSlug(program != null ? program.getSlug() : null)
                .eventId(event != null ? event.getId() : null)
                .eventTitle(event != null ? event.getTitle() : null)
                .scheduledDate(session.getScheduledDate())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .timezone(session.getTimezone())
                .location(session.getLocation())
                .coachUserId(coach != null ? coach.getId() : null)
                .coachName(coach != null ? coach.getName() : null)
                .coachEmail(coach != null ? coach.getEmail() : null)
                .coachLabel(StringUtils.hasText(session.getCoachLabel())
                        ? session.getCoachLabel()
                        : (coach != null ? coach.getName() : null))
                .capacity(session.getCapacity())
                .registrationCount(roster.stream()
                        .filter(registration -> ACTIVE_ROSTER_STATUSES.contains(registration.getStatus()))
                        .count())
                .roster(roster.stream().map(this::toRosterRegistrationResponse).toList())
                .status(session.getStatus())
                .notes(session.getNotes())
                .sessionSeriesId(session.getSessionSeries() != null ? session.getSessionSeries().getId() : null)
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .build();
    }

    private RegistrationResponse toRosterRegistrationResponse(Registration registration) {
        Program program = registration.getProgram();
        return RegistrationResponse.builder()
                .id(registration.getId())
                .registrationCode(registration.getRegistrationCode())
                .offeringType(registration.getOfferingType())
                .programId(program != null ? program.getId() : null)
                .programName(program != null ? program.getName() : null)
                .programSlug(program != null ? program.getSlug() : null)
                .trainingSessionId(registration.getTrainingSession() != null ? registration.getTrainingSession().getId() : null)
                .eventId(registration.getEvent() != null ? registration.getEvent().getId() : null)
                .eventTitle(registration.getEvent() != null ? registration.getEvent().getTitle() : null)
                .registrationType(registration.getRegistrationType())
                .status(registration.getStatus())
                .paymentStatus(registration.getPaymentStatus())
                .source(registration.getSource())
                .participantName(registration.getParticipantName())
                .participantAge(registration.getParticipantAge())
                .participantEmail(registration.getParticipantEmail())
                .participantPhone(registration.getParticipantPhone())
                .guardianName(registration.getGuardianName())
                .guardianEmail(registration.getGuardianEmail())
                .guardianPhone(registration.getGuardianPhone())
                .experienceLevel(registration.getExperienceLevel())
                .scheduledDate(registration.getScheduledDate())
                .scheduledStartTime(registration.getScheduledStartTime())
                .scheduledEndTime(registration.getScheduledEndTime())
                .timezone(registration.getTimezone())
                .priceAmount(registration.getPriceAmount())
                .currency(registration.getCurrency())
                .amountPaid(registration.getAmountPaid())
                .waiverAccepted(registration.isWaiverAccepted())
                .customerNotes(registration.getCustomerNotes())
                .waitlistPosition(registration.getWaitlistPosition())
                .waitlistedAt(registration.getWaitlistedAt())
                .cancelledAt(registration.getCancelledAt())
                .cancelledByType(registration.getCancelledByType())
                .cancelledByLabel(registration.getCancelledByLabel())
                .cancellationReason(registration.getCancellationReason())
                .confirmedAt(registration.getConfirmedAt())
                .completedAt(registration.getCompletedAt())
                .createdAt(registration.getCreatedAt())
                .updatedAt(registration.getUpdatedAt())
                .history(List.of())
                .build();
    }

}
