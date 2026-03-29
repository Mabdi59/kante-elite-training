package com.kanteelite.training.repository;

import com.kanteelite.training.entity.TeamRegistration;
import com.kanteelite.training.enums.TeamRegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRegistrationRepository extends JpaRepository<TeamRegistration, Long> {
    List<TeamRegistration> findByTournamentId(Long tournamentId);
    boolean existsByTournamentIdAndTeamId(Long tournamentId, Long teamId);
    long countByTournamentId(Long tournamentId);
    long countByStatus(TeamRegistrationStatus status);
}
