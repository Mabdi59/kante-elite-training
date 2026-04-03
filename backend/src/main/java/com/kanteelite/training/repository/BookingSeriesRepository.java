package com.kanteelite.training.repository;

import com.kanteelite.training.entity.BookingSeries;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingSeriesRepository extends JpaRepository<BookingSeries, Long> {
    List<BookingSeries> findAllByOrderByCreatedAtDesc();
    List<BookingSeries> findByCoachUserIdOrderByStartDateAsc(Long coachUserId);
    List<BookingSeries> findByActiveTrue();
}
