package com.kanteelite.training.repository;

import com.kanteelite.training.entity.BlockedSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BlockedSlotRepository extends JpaRepository<BlockedSlot, Long> {
    List<BlockedSlot> findBySlotDateOrderBySlotTimeAsc(LocalDate date);

    @Query("SELECT b FROM BlockedSlot b WHERE b.slotDate = :date AND (b.slotTime IS NULL OR b.slotTime = :time)")
    List<BlockedSlot> findBlockingSlots(@Param("date") LocalDate date, @Param("time") String time);

    List<BlockedSlot> findAllByOrderBySlotDateDescCreatedAtDesc();
}
