package com.kanteelite.training.repository;

import com.kanteelite.training.entity.TeamRegistration;
import com.kanteelite.training.enums.PaymentStatus;
import com.kanteelite.training.enums.TeamRegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRegistrationRepository extends JpaRepository<TeamRegistration, Long> {
    List<TeamRegistration> findByTournamentId(Long tournamentId);
    Optional<TeamRegistration> findByTournamentIdAndTeamId(Long tournamentId, Long teamId);
    List<TeamRegistration> findByTeamOwnerUserEmailIgnoreCaseOrderByCreatedAtDesc(String email);
    Optional<TeamRegistration> findByIdAndTeamOwnerUserEmailIgnoreCase(Long id, String email);
    Optional<TeamRegistration> findByGuestAccessToken(String guestAccessToken);
    Optional<TeamRegistration> findByPaymentSessionId(String paymentSessionId);
    boolean existsByTournamentIdAndTeamId(Long tournamentId, Long teamId);
    long countByTournamentId(Long tournamentId);
    long countByTeamId(Long teamId);
    long countByTeamOwnerUserEmailIgnoreCase(String email);
    long countByTeamOwnerUserEmailIgnoreCaseAndStatus(String email, TeamRegistrationStatus status);
    long countByStatus(TeamRegistrationStatus status);
    long countByPaymentStatus(PaymentStatus paymentStatus);

    @Query("""
            select tr from TeamRegistration tr
            join fetch tr.tournament t
            join fetch tr.team team
            where tr.createdAt <= :threshold
              and tr.status in :activeStatuses
              and (
                    ((t.entryFee is not null and t.entryFee > 0)
                        and tr.paymentStatus <> com.kanteelite.training.enums.PaymentStatus.PAID
                        and tr.paymentStatus <> com.kanteelite.training.enums.PaymentStatus.NOT_REQUIRED
                        and tr.paymentReminderSentAt is null)
                    or
                    (tr.rosterSubmittedAt is null and tr.rosterReminderSentAt is null)
                  )
            order by tr.createdAt asc
            """)
    List<TeamRegistration> findRegistrationsNeedingFollowUp(
            LocalDateTime threshold,
            List<TeamRegistrationStatus> activeStatuses);
}
