package com.kanteelite.training.repository;

import com.kanteelite.training.entity.BookingSeries;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface BookingSeriesRepository extends JpaRepository<BookingSeries, Long> {
    List<BookingSeries> findAllByOrderByCreatedAtDesc();
    List<BookingSeries> findByCoachUserIdOrderByStartDateAsc(Long coachUserId);
    List<BookingSeries> findByActiveTrue();
    long countByActiveTrue();

    /** Returns active series that contain at least one player whose ID is in {@code playerIds}. */
    @Query("SELECT DISTINCT s FROM BookingSeries s JOIN s.players p WHERE s.active = true AND p.id IN :playerIds")
    List<BookingSeries> findActiveSeriesByPlayerIds(@Param("playerIds") Collection<Long> playerIds);
}
