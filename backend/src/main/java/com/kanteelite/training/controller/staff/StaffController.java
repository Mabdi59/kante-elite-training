package com.kanteelite.training.controller.staff;

import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.StaffDashboardResponse;
import com.kanteelite.training.entity.Booking;
import com.kanteelite.training.enums.BookingStatus;
import com.kanteelite.training.enums.TeamRegistrationStatus;
import com.kanteelite.training.repository.BlockedSlotRepository;
import com.kanteelite.training.repository.BookingRepository;
import com.kanteelite.training.repository.ContactMessageRepository;
import com.kanteelite.training.repository.PlayerProfileRepository;
import com.kanteelite.training.repository.TeamRegistrationRepository;
import com.kanteelite.training.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController {

    private final BookingRepository bookingRepository;
    private final ContactMessageRepository contactMessageRepository;
    private final BlockedSlotRepository blockedSlotRepository;
    private final TeamRegistrationRepository teamRegistrationRepository;
    private final PlayerProfileRepository playerProfileRepository;
    private final TournamentRepository tournamentRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<StaffDashboardResponse>> getDashboard() {
        LocalDate today = LocalDate.now();
        List<Booking> bookings = bookingRepository.findAllByOrderByCreatedAtDesc();

        long todayBookings = bookings.stream()
                .filter(booking -> today.equals(booking.getBookingDate()))
                .count();

        long upcomingBookings = bookings.stream()
                .filter(booking -> !booking.getBookingDate().isBefore(today))
                .filter(booking -> booking.getBookingStatus() != BookingStatus.CANCELLED)
                .count();

        StaffDashboardResponse stats = StaffDashboardResponse.builder()
                .totalBookings(bookingRepository.count())
                .todayBookings(todayBookings)
                .upcomingBookings(upcomingBookings)
                .confirmedBookings(bookingRepository.countByBookingStatus(BookingStatus.CONFIRMED))
                .unreadMessages(contactMessageRepository.countByReadStatusFalse())
                .blockedSlots(blockedSlotRepository.count())
                .pendingRegistrations(teamRegistrationRepository.countByStatus(TeamRegistrationStatus.PENDING))
                .totalPlayers(playerProfileRepository.countByActiveTrue())
                .totalTournaments(tournamentRepository.count())
                .build();

        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
