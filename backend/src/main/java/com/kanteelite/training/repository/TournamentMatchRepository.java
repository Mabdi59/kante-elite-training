package com.kanteelite.training.repository;

import com.kanteelite.training.entity.TournamentMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TournamentMatchRepository extends JpaRepository<TournamentMatch, Long> {
    List<TournamentMatch> findByTournamentIdOrderByMatchDateAscKickoffTimeAscIdAsc(Long tournamentId);
    long countByTournamentId(Long tournamentId);
    long countByTournamentIdAndStatusIgnoreCase(Long tournamentId, String status);
    void deleteByTournamentId(Long tournamentId);
}
