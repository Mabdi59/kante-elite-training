package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.BookingRequest;
import com.kanteelite.training.dto.request.RescheduleRequest;
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
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ProgramService programService;
    private final EmailService emailService;
    private final AvailabilityService availabilityService;
    private final AuditLogService auditLogService;

    /**
     * Creates a booking directly without payment.
     */
    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        return createBooking(request, null);
    }

    /**
     * Creates a booking and links it to the authenticated account when available.
     */
    @Transactional
    public BookingResponse createBooking(BookingRequest request, String authenticatedEmail) {
        Program program = programService.getProgramEntityById(request.getProgramId());
        String bookingEmail = normalizeEmail(
                StringUtils.hasText(authenticatedEmail) ? authenticatedEmail : request.getEmail());

        boolean slotTaken = bookingRepository.existsByProgramIdAndBookingDateAndBookingTimeAndBookingStatusNot(
                request.getProgramId(), request.getBookingDate(), request.getBookingTime(), BookingStatus.CANCELLED
        );
        if (slotTaken) {
            throw new SlotUnavailableException("This time slot is already booked. Please choose a different time.");
        }
        if (availabilityService.isSlotBlocked(request.getBookingDate(), request.getBookingTime())) {
            throw new SlotUnavailableException("This time slot is not available. Please choose a different time.");
        }

        Booking booking = Booking.builder()
                .program(program)
                .bookingDate(request.getBookingDate())
                .bookingTime(request.getBookingTime())
                .playerName(request.getPlayerName())
                .playerAge(request.getPlayerAge())
                .parentName(request.getParentName())
                .email(bookingEmail)
                .phone(request.getPhone())
                .experienceLevel(request.getExperienceLevel())
                .notes(request.getNotes())
                .paymentStatus(PaymentStatus.PENDING)
                .bookingStatus(BookingStatus.CONFIRMED)
                .build();

        Booking saved = bookingRepository.save(booking);
        BookingResponse response = toResponse(saved);
        emailService.sendBookingConfirmation(response);
        auditLogService.log(bookingEmail, "CREATE", "Booking", saved.getId(),
                "Booked " + program.getName() + " on " + request.getBookingDate() + " at " + request.getBookingTime());
        return response;
    }

    /** Retrieves a booking by database ID. */
    @Transactional(readOnly = true)
    public BookingResponse getById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));
        return toResponse(booking);
    }

    /** Returns all bookings, newest first (admin use). */
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    /** Returns bookings for the authenticated user identified by email. */
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByEmail(String email) {
        return bookingRepository.findByEmailIgnoreCaseOrderByCreatedAtDesc(email)
                .stream().map(this::toResponse).toList();
    }

    /** Updates the status of a booking (admin use). */
    @Transactional
    public BookingResponse updateStatus(Long id, String bookingStatus, String actorEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));
        String old = booking.getBookingStatus().name();
        booking.setBookingStatus(BookingStatus.valueOf(bookingStatus));
        BookingResponse response = toResponse(bookingRepository.save(booking));
        auditLogService.log(actorEmail, "UPDATE_STATUS", "Booking", id,
                "Status changed from " + old + " to " + bookingStatus);
        return response;
    }

    /** Cancels a user's own booking. */
    @Transactional
    public BookingResponse cancelOwnBooking(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));
        if (!booking.getEmail().equalsIgnoreCase(userEmail)) {
            throw new IllegalArgumentException("You are not authorized to cancel this booking.");
        }
        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Booking is already cancelled.");
        }
        booking.setBookingStatus(BookingStatus.CANCELLED);
        BookingResponse response = toResponse(bookingRepository.save(booking));
        auditLogService.log(userEmail, "CANCEL", "Booking", id, "User cancelled their booking.");
        return response;
    }

    /** Reschedules a booking to a new date/time (admin use). */
    @Transactional
    public BookingResponse reschedule(Long id, RescheduleRequest req, String actorEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        boolean slotTaken = bookingRepository.existsByProgramIdAndBookingDateAndBookingTimeAndBookingStatusNot(
                booking.getProgram().getId(), req.getNewDate(), req.getNewTime(), BookingStatus.CANCELLED
        );
        if (slotTaken) {
            throw new SlotUnavailableException("The new time slot is already booked.");
        }
        if (availabilityService.isSlotBlocked(req.getNewDate(), req.getNewTime())) {
            throw new SlotUnavailableException("The new time slot is not available.");
        }

        String oldSlot = booking.getBookingDate() + " " + booking.getBookingTime();
        booking.setBookingDate(req.getNewDate());
        booking.setBookingTime(req.getNewTime());
        BookingResponse response = toResponse(bookingRepository.save(booking));
        auditLogService.log(actorEmail, "RESCHEDULE", "Booking", id,
                "Moved from " + oldSlot + " to " + req.getNewDate() + " " + req.getNewTime());
        return response;
    }

    /** Allows a coach to update the status of a session assigned to their email. */
    @Transactional
    public BookingResponse updateCoachSessionStatus(Long id, String bookingStatus, String coachEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));
        ensureCoachOwnsBooking(booking, coachEmail);

        BookingStatus nextStatus = BookingStatus.valueOf(bookingStatus);
        if (nextStatus != BookingStatus.CONFIRMED
                && nextStatus != BookingStatus.COMPLETED
                && nextStatus != BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Coaches can only set status to CONFIRMED, COMPLETED, or CANCELLED.");
        }

        String oldStatus = booking.getBookingStatus().name();
        booking.setBookingStatus(nextStatus);
        BookingResponse response = toResponse(bookingRepository.save(booking));
        auditLogService.log(coachEmail, "COACH_UPDATE_STATUS", "Booking", id,
                "Coach changed status from " + oldStatus + " to " + bookingStatus);
        return response;
    }

    /** Allows a coach to reschedule a session assigned to their email. */
    @Transactional
    public BookingResponse rescheduleCoachSession(Long id, RescheduleRequest req, String coachEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));
        ensureCoachOwnsBooking(booking, coachEmail);
        return reschedule(id, req, coachEmail);
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
                .stripeSessionId(b.getStripeSessionId())
                .createdAt(b.getCreatedAt())
                .build();
    }

    private void ensureCoachOwnsBooking(Booking booking, String coachEmail) {
        if (!booking.getEmail().equalsIgnoreCase(coachEmail)) {
            throw new IllegalArgumentException("You are not authorized to manage this session.");
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
