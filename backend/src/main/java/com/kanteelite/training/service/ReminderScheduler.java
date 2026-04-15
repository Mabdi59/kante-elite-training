package com.kanteelite.training.service;

import com.kanteelite.training.dto.response.BookingResponse;
import com.kanteelite.training.entity.Booking;
import com.kanteelite.training.enums.BookingStatus;
import com.kanteelite.training.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReminderScheduler {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 8 * * *")
    public void sendSessionReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Booking> tomorrowBookings = bookingRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(b -> b.getBookingDate().equals(tomorrow)
                        && b.getBookingStatus() == BookingStatus.CONFIRMED)
                .toList();

        for (Booking booking : tomorrowBookings) {
            try {
                notificationService.send(
                        booking.getEmail(),
                        "SESSION_REMINDER",
                        "Reminder: Session Tomorrow",
                        "You have a " + booking.getProgram().getName() + " session tomorrow at " + booking.getBookingTime(),
                        "Booking",
                        booking.getId()
                );
                log.info("Sent session reminder to {} for booking {}", booking.getEmail(), booking.getId());
            } catch (Exception e) {
                log.error("Failed to send reminder for booking {}: {}", booking.getId(), e.getMessage());
            }

            try {
                BookingResponse response = BookingResponse.builder()
                        .id(booking.getId())
                        .programId(booking.getProgram() != null ? booking.getProgram().getId() : null)
                        .programName(booking.getProgram() != null ? booking.getProgram().getName() : null)
                        .bookingDate(booking.getBookingDate())
                        .bookingTime(booking.getBookingTime())
                        .playerName(booking.getPlayerName())
                        .playerAge(booking.getPlayerAge())
                        .parentName(booking.getParentName())
                        .email(booking.getEmail())
                        .phone(booking.getPhone())
                        .bookingStatus(booking.getBookingStatus())
                        .paymentStatus(booking.getPaymentStatus())
                        .createdAt(booking.getCreatedAt())
                        .build();
                emailService.sendSessionReminder(response);
            } catch (Exception e) {
                log.error("Failed to send email reminder for booking {}: {}", booking.getId(), e.getMessage());
            }
        }
    }
}
