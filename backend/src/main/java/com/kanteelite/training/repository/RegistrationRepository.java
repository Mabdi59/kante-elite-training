package com.kanteelite.training.repository;

import com.kanteelite.training.entity.Registration;
import com.kanteelite.training.enums.RegistrationOfferingType;
import com.kanteelite.training.enums.RegistrationStatus;
import com.kanteelite.training.enums.RegistrationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    Optional<Registration> findByRegistrationCode(String registrationCode);

    Optional<Registration> findFirstByTrainingSessionIdOrderByCreatedAtAsc(Long trainingSessionId);

    List<Registration> findByTrainingSessionIdOrderByCreatedAtAsc(Long trainingSessionId);

    List<Registration> findByProgramIdOrderByCreatedAtAsc(Long programId);

    List<Registration> findByEventIdOrderByCreatedAtAsc(Long eventId);

    List<Registration> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    List<Registration> findByScheduledDateAndStatusInOrderByScheduledStartTimeAscCreatedAtAsc(
            LocalDate scheduledDate,
            Collection<RegistrationStatus> statuses
    );

    long countByStatus(RegistrationStatus status);

    long countByStatusIn(Collection<RegistrationStatus> statuses);

    long countByScheduledDateAndStatusIn(LocalDate scheduledDate, Collection<RegistrationStatus> statuses);

    long countByScheduledDateGreaterThanEqualAndStatusIn(LocalDate scheduledDate, Collection<RegistrationStatus> statuses);

    @Query("""
            SELECT r FROM Registration r
            LEFT JOIN FETCH r.program
            LEFT JOIN FETCH r.event
            ORDER BY r.createdAt DESC
            """)
    List<Registration> findAllWithOfferingsOrderByCreatedAtDesc();

    @Query("""
            SELECT r FROM Registration r
            LEFT JOIN FETCH r.program
            LEFT JOIN FETCH r.event
            LEFT JOIN FETCH r.trainingSession
            WHERE LOWER(r.guardianEmail) = LOWER(:email)
               OR LOWER(r.participantEmail) = LOWER(:email)
            ORDER BY r.createdAt DESC
            """)
    List<Registration> findAccountHistoryByEmail(@Param("email") String email);

    long countByProgramIdAndStatusIn(Long programId, Collection<RegistrationStatus> statuses);

    @Query("""
            SELECT COUNT(r) FROM Registration r
            WHERE r.program.id = :programId
              AND r.status IN :statuses
              AND r.registrationType <> :excludedType
            """)
    long countProgramRosterRegistrations(
            @Param("programId") Long programId,
            @Param("statuses") Collection<RegistrationStatus> statuses,
            @Param("excludedType") RegistrationType excludedType
    );

    long countByEventIdAndStatusIn(Long eventId, Collection<RegistrationStatus> statuses);

    long countByProgramIdAndScheduledDateAndScheduledStartTimeAndStatusIn(
            Long programId,
            LocalDate scheduledDate,
            String scheduledStartTime,
            Collection<RegistrationStatus> statuses
    );

    long countByTrainingSessionIdAndStatusIn(Long trainingSessionId, Collection<RegistrationStatus> statuses);

    boolean existsByProgramIdAndScheduledDateAndScheduledStartTimeAndStatusInAndIdNot(
            Long programId,
            LocalDate scheduledDate,
            String scheduledStartTime,
            Collection<RegistrationStatus> statuses,
            Long id
    );

    boolean existsByEventIdAndGuardianEmailIgnoreCaseAndStatusNot(Long eventId, String guardianEmail, RegistrationStatus status);

    boolean existsByEventIdAndTrainingSessionIdAndGuardianEmailIgnoreCaseAndStatusNot(
            Long eventId,
            Long trainingSessionId,
            String guardianEmail,
            RegistrationStatus status
    );

    boolean existsByProgramIdAndGuardianEmailIgnoreCaseAndRegistrationTypeAndStatusNot(
            Long programId,
            String guardianEmail,
            RegistrationType registrationType,
            RegistrationStatus status
    );

    int countByOfferingTypeAndProgramIdAndStatus(
            RegistrationOfferingType offeringType,
            Long programId,
            RegistrationStatus status
    );

    int countByOfferingTypeAndEventIdAndStatus(
            RegistrationOfferingType offeringType,
            Long eventId,
            RegistrationStatus status
    );
}
