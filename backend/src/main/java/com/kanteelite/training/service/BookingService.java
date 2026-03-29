package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.BookingRequest;
import com.kanteelite.training.dto.response.BookingResponse;
import com.kanteelite.training.entity.Booking;
import com.kanteelite.training.entity.Program;
import com.kanteelite.training.enums.BookingStatus;
import com.kanteelite.training.enums.PaymentStatus;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.exception.SlotUnavailableException;
import com.kanteelite.training.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ProgramService programService;
    private final EmailService emailService;

    /**
     * Creates a booking directly (no payment). Used for free/test flows.
     */
    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        Program program = programService.getProgramEntityById(request.getProgramId());

        boolean slotTaken = bookingRepository.existsByProgramIdAndBookingDateAndBookingTimeAndBookingStatusNot(
                request.getProgramId(), request.getBookingDate(), request.getBookingTime(), BookingStatus.CANCELLED
        );
        if (slotTaken) {
            throw new SlotUnavailableException("This time slot is already booked. Please choose a different time.");
        }

        Booking booking = Booking.builder()
                .program(program)
                .bookingDate(request.getBookingDate())
                .bookingTime(request.getBookingTime())
                .playerName(request.getPlayerName())
                .playerAge(request.getPlayerAge())
                .parentName(request.getParentName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .experienceLevel(request.getExperienceLevel())
                .notes(request.getNotes())
                .paymentStatus(PaymentStatus.PENDING)
                .bookingStatus(BookingStatus.CONFIRMED)
                .build();

        Booking saved = bookingRepository.save(booking);
        BookingResponse response = toResponse(saved);
        emailService.sendBookingConfirmation(response);
        return response;
    }

    /**
     * Creates or retrieves a confirmed booking by Stripe session ID.
     * Idempotent — safe to call multiple times for the same session.
     */
    @Transactional
    public BookingResponse confirmByStripeSession(String sessionId, BookingRequest request) {
        Optional<Booking> existing = bookingRepository.findByStripeSessionId(sessionId);
        if (existing.isPresent()) {
            return toResponse(existing.get());
        }

        Program program = programService.getProgramEntityById(request.getProgramId());

        Booking booking = Booking.builder()
                .program(program)
                .bookingDate(request.getBookingDate())
                .bookingTime(request.getBookingTime())
                .playerName(request.getPlayerName())
                .playerAge(request.getPlayerAge())
                .parentName(request.getParentName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .experienceLevel(request.getExperienceLevel())
                .notes(request.getNotes())
                .paymentStatus(PaymentStatus.PAID)
                .bookingStatus(BookingStatus.CONFIRMED)
                .stripeSessionId(sessionId)
                .build();

        Booking saved = bookingRepository.save(booking);
        BookingResponse response = toResponse(saved);
        emailService.sendBookingConfirmation(response);
        return response;
    }

    /**
     * Retrieves a confirmed booking by database ID.
     */
    @Transactional(readOnly = true)
    public BookingResponse getById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));
        return toResponse(booking);
    }

    /**
     * Retrieves a confirmed booking by Stripe session ID (for the success page).
     */
    @Transactional(readOnly = true)
    public BookingResponse getByStripeSessionId(String sessionId) {
        Booking booking = bookingRepository.findByStripeSessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found for session: " + sessionId));
        return toResponse(booking);
    }

    public BookingResponse toResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .programName(b.getProgram().getName())
                .programSlug(b.getProgram().getSlug())
                .bookingDate(b.getBookingDate())
                .bookingTime(b.getBookingTime())
                .playerName(b.getPlayerName())
                .playerAge(b.getPlayerAge())
                .parentName(b.getParentName())
                .email(b.getEmail())
                .phone(b.getPhone())
                .experienceLevel(b.getExperienceLevel())
                .notes(b.getNotes())
                .paymentStatus(b.getPaymentStatus())
                .bookingStatus(b.getBookingStatus())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
