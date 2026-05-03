package com.kanteelite.training.repository;

import com.kanteelite.training.entity.SessionSeries;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface SessionSeriesRepository extends JpaRepository<SessionSeries, Long> {
    List<SessionSeries> findAllByOrderByCreatedAtDesc();
    long countByActiveTrue();

    @Query("SELECT DISTINCT s FROM SessionSeries s JOIN s.players p WHERE s.active = true AND p.id IN :playerIds")
    List<SessionSeries> findActiveSeriesByPlayerIds(@Param("playerIds") Collection<Long> playerIds);
}
