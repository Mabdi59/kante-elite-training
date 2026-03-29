package com.kanteelite.training.repository;

import com.kanteelite.training.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByStripeSessionId(String stripeSessionId);

    @Query("SELECT b.bookingTime FROM Booking b WHERE b.program.id = :programId AND b.bookingDate = :date AND b.bookingStatus NOT IN ('CANCELLED')")
    List<String> findBookedTimesByProgramAndDate(@Param("programId") Long programId, @Param("date") LocalDate date);

    boolean existsByProgramIdAndBookingDateAndBookingTimeAndBookingStatusNot(
        Long programId, LocalDate date, String time, com.kanteelite.training.enums.BookingStatus status
    );
}
