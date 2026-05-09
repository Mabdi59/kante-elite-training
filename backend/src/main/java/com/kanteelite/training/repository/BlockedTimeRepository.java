package com.kanteelite.training.repository;

import com.kanteelite.training.entity.BlockedTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BlockedTimeRepository extends JpaRepository<BlockedTime, Long> {

    List<BlockedTime> findByCoachUserIdOrderByStartDatetimeDesc(Long coachUserId);

    @Query("""
            SELECT b FROM BlockedTime b
            WHERE b.coachUser.id = :coachId
              AND b.startDatetime < :endDatetime
              AND b.endDatetime > :startDatetime
            ORDER BY b.startDatetime ASC
            """)
    List<BlockedTime> findOverlappingBlockedTimes(
            @Param("coachId") Long coachId,
            @Param("startDatetime") LocalDateTime startDatetime,
            @Param("endDatetime") LocalDateTime endDatetime);
}
