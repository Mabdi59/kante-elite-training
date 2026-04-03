package com.kanteelite.training.repository;

import com.kanteelite.training.entity.Booking;
import com.kanteelite.training.enums.BookingStatus;
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

    boolean existsByProgramIdAndBookingDateAndBookingTimeAndBookingStatusNotAndIdNot(
        Long programId, LocalDate date, String time, com.kanteelite.training.enums.BookingStatus status, Long id
    );

    @Query("SELECT b FROM Booking b JOIN FETCH b.program ORDER BY b.createdAt DESC")
    List<Booking> findAllByOrderByCreatedAtDesc();

    @Query("SELECT b FROM Booking b JOIN FETCH b.program WHERE LOWER(b.email) = LOWER(:email) ORDER BY b.createdAt DESC")
    List<Booking> findByEmailIgnoreCaseOrderByCreatedAtDesc(@Param("email") String email);

    long countByBookingStatus(BookingStatus status);

    @Query("SELECT b FROM Booking b JOIN FETCH b.program WHERE LOWER(b.playerName) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(b.email) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(COALESCE(b.parentName, '')) LIKE LOWER(CONCAT('%', :q, '%')) ORDER BY b.createdAt DESC")
    List<Booking> searchByQuery(@Param("q") String q, org.springframework.data.domain.Pageable pageable);
}
