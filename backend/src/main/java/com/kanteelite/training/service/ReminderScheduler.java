package com.kanteelite.training.service;

import com.kanteelite.training.dto.response.RegistrationResponse;
import com.kanteelite.training.entity.Program;
import com.kanteelite.training.entity.Registration;
import com.kanteelite.training.enums.RegistrationStatus;
import com.kanteelite.training.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReminderScheduler {

    private static final Set<RegistrationStatus> REMINDER_STATUSES = Set.of(RegistrationStatus.CONFIRMED);

    private final RegistrationRepository registrationRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 8 * * *")
    public void sendSessionReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Registration> tomorrowRegistrations =
                registrationRepository.findByScheduledDateAndStatusInOrderByScheduledStartTimeAscCreatedAtAsc(
                        tomorrow, REMINDER_STATUSES);

        for (Registration registration : tomorrowRegistrations) {
            Program program = registration.getProgram();
            if (program == null) {
                continue;
            }
            try {
                notificationService.send(
                        registration.getGuardianEmail(),
                        "SESSION_REMINDER",
                        "Reminder: Session Tomorrow",
                        "You have a " + program.getName() + " session tomorrow at "
                                + registration.getScheduledStartTime(),
                        "Registration",
                        registration.getId()
                );
                log.info("Sent session reminder to {} for registration {}",
                        registration.getGuardianEmail(), registration.getId());
            } catch (Exception e) {
                log.error("Failed to send reminder for registration {}: {}",
                        registration.getId(), e.getMessage());
            }

            try {
                emailService.sendSessionReminder(toRegistrationReminder(registration));
            } catch (Exception e) {
                log.error("Failed to send email reminder for registration {}: {}",
                        registration.getId(), e.getMessage());
            }
        }
    }

    private RegistrationResponse toRegistrationReminder(Registration registration) {
        Program program = registration.getProgram();
        return RegistrationResponse.builder()
                .id(registration.getId())
                .registrationCode(registration.getRegistrationCode())
                .programId(program != null ? program.getId() : null)
                .programName(program != null ? program.getName() : null)
                .scheduledDate(registration.getScheduledDate())
                .scheduledStartTime(registration.getScheduledStartTime())
                .participantName(registration.getParticipantName())
                .participantAge(registration.getParticipantAge())
                .guardianName(registration.getGuardianName())
                .guardianEmail(registration.getGuardianEmail())
                .guardianPhone(registration.getGuardianPhone())
                .status(registration.getStatus())
                .paymentStatus(registration.getPaymentStatus())
                .createdAt(registration.getCreatedAt())
                .build();
    }
}
