package com.kanteelite.training.service;

import com.kanteelite.training.dto.response.TeamRegistrationResponse;
import com.kanteelite.training.entity.TeamRegistration;
import com.kanteelite.training.enums.PaymentStatus;
import com.kanteelite.training.enums.TeamRegistrationStatus;
import com.kanteelite.training.repository.TeamRegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TournamentRegistrationFollowUpService {

    private final TeamRegistrationRepository teamRegistrationRepository;
    private final TournamentService tournamentService;
    private final EmailService emailService;
    private final AuditLogService auditLogService;

    @Scheduled(cron = "${app.tournaments.follow-up.cron:0 0 */6 * * *}")
    @Transactional
    public void sendPendingFollowUps() {
        LocalDateTime threshold = LocalDateTime.now().minusHours(24);
        List<TeamRegistration> registrations = teamRegistrationRepository.findRegistrationsNeedingFollowUp(
                threshold,
                List.of(
                        TeamRegistrationStatus.PENDING,
                        TeamRegistrationStatus.APPROVED,
                        TeamRegistrationStatus.WAITLISTED
                )
        );

        for (TeamRegistration registration : registrations) {
            TeamRegistrationResponse response = tournamentService.toRegResponse(registration);
            emailService.sendTournamentRegistrationUpdate(
                    response,
                    "Tournament Registration Reminder, Kante Elite Training",
                    "Action Needed",
                    buildReminderIntro(registration),
                    tournamentService.toDashboardResponse(registration).getNextSteps()
            );

            if (registration.getRosterSubmittedAt() == null) {
                registration.setRosterReminderSentAt(LocalDateTime.now());
            }
            if (registration.getTournament().getEntryFee() != null
                    && registration.getTournament().getEntryFee().signum() > 0
                    && registration.getPaymentStatus() != PaymentStatus.PAID
                    && registration.getPaymentStatus() != PaymentStatus.NOT_REQUIRED) {
                registration.setPaymentReminderSentAt(LocalDateTime.now());
            }
            registration.setLastFollowUpSentAt(LocalDateTime.now());
            teamRegistrationRepository.save(registration);
            auditLogService.log(registration.getTeam().getContactEmail(), "FOLLOW_UP_SENT", "TeamRegistration",
                    registration.getId(), "Automated tournament follow up email sent.");
        }
    }

    private String buildReminderIntro(TeamRegistration registration) {
        if (registration.getRosterSubmittedAt() == null
                && registration.getPaymentStatus() != PaymentStatus.PAID
                && registration.getPaymentStatus() != PaymentStatus.NOT_REQUIRED) {
            return "Your team registration is active, but we are still waiting on your payment step and roster submission.";
        }
        if (registration.getRosterSubmittedAt() == null) {
            return "Your team registration is active, but we are still waiting on your roster details.";
        }
        return "Your team registration is active, but we are still waiting on your payment step.";
    }
}
