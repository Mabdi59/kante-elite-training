package com.kanteelite.training.repository;

import com.kanteelite.training.entity.TeamPlayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamPlayerRepository extends JpaRepository<TeamPlayer, Long> {
    List<TeamPlayer> findByTeamIdOrderByCaptainDescFullNameAsc(Long teamId);
    List<TeamPlayer> findByTeamIdIn(List<Long> teamIds);
    long countByTeamId(Long teamId);
}
