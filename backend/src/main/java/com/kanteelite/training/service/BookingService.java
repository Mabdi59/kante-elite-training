package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.AdminBookingRequest;
import com.kanteelite.training.dto.request.BookingRequest;
import com.kanteelite.training.dto.request.RescheduleRequest;
import com.kanteelite.training.dto.response.BookingResponse;
import com.kanteelite.training.entity.Booking;
import com.kanteelite.training.entity.Program;
import com.kanteelite.training.enums.BookingStatus;
import com.kanteelite.training.enums.PaymentStatus;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.exception.SlotUnavailableException;
import com.kanteelite.training.repository.AttendanceRecordRepository;
import com.kanteelite.training.repository.BookingRepository;
import com.kanteelite.training.repository.PlayerProgressNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
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
    private final NotificationService notificationService;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final PlayerProgressNoteRepository playerProgressNoteRepository;

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
        String bookingEmail = normalizeEmail(
                StringUtils.hasText(authenticatedEmail) ? authenticatedEmail : request.getEmail());
        Booking booking = Booking.builder()
                .paymentStatus(PaymentStatus.PENDING)
                .bookingStatus(BookingStatus.CONFIRMED)
                .build();
        Booking saved = bookingRepository.save(applyBookingDetails(
                booking,
                request.getProgramId(),
                request.getBookingDate(),
                request.getBookingTime(),
                request.getPlayerName(),
                request.getPlayerAge(),
                request.getParentName(),
                bookingEmail,
                request.getPhone(),
                request.getExperienceLevel(),
                request.getNotes(),
                null
        ));
        BookingResponse response = toResponse(saved);
        boolean confirmationEmailAvailable = emailService.sendBookingConfirmation(response);
        response.setConfirmationEmailAvailable(confirmationEmailAvailable);
        auditLogService.log(bookingEmail, "CREATE", "Booking", saved.getId(),
                "Booked " + saved.getProgram().getName() + " on " + request.getBookingDate() + " at " + request.getBookingTime());
        return response;
    }

    @Transactional
    public BookingResponse createAdminBooking(AdminBookingRequest request, String actorEmail) {
        Booking booking = Booking.builder()
                .paymentStatus(PaymentStatus.PENDING)
                .bookingStatus(BookingStatus.CONFIRMED)
                .build();
        Booking saved = bookingRepository.save(applyBookingDetails(
                booking,
                request.getProgramId(),
                request.getBookingDate(),
                request.getBookingTime(),
                request.getPlayerName(),
                request.getPlayerAge(),
                request.getParentName(),
                request.getEmail(),
                request.getPhone(),
                request.getExperienceLevel(),
                request.getNotes(),
                null
        ));
        BookingResponse response = toResponse(saved);
        response.setConfirmationEmailAvailable(emailService.sendBookingConfirmation(response));
        auditLogService.log(actorEmail, "CREATE", "Booking", saved.getId(),
                "Admin created booking for " + saved.getEmail() + " in " + saved.getProgram().getName());
        return response;
    }

    @Transactional
    public BookingResponse updateBooking(Long id, AdminBookingRequest request, String actorEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));
        Booking saved = bookingRepository.save(applyBookingDetails(
                booking,
                request.getProgramId(),
                request.getBookingDate(),
                request.getBookingTime(),
                request.getPlayerName(),
                request.getPlayerAge(),
                request.getParentName(),
                request.getEmail(),
                request.getPhone(),
                request.getExperienceLevel(),
                request.getNotes(),
                id
        ));
        auditLogService.log(actorEmail, "UPDATE", "Booking", id,
                "Admin updated booking for " + saved.getEmail() + " in " + saved.getProgram().getName());
        return toResponse(saved);
    }

    /** Retrieves a booking by database ID. */
    @Transactional(readOnly = true)
    public BookingResponse getById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));
        return toResponse(booking);
    }

    /** Returns a booking by its Stripe checkout session ID, or null if not yet created. */
    @Transactional(readOnly = true)
    public BookingResponse getByStripeSessionId(String sessionId) {
        return bookingRepository.findByStripeSessionId(sessionId)
                .map(this::toResponse)
                .orElse(null);
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
        BookingStatus previousStatus = booking.getBookingStatus();
        BookingStatus nextStatus = BookingStatus.valueOf(bookingStatus);

        booking.setBookingStatus(nextStatus);
        Booking saved = bookingRepository.save(booking);
        notifyBookingCreatorOfStatusChange(saved, previousStatus, nextStatus);

        BookingResponse response = toResponse(saved);
        auditLogService.log(actorEmail, "UPDATE_STATUS", "Booking", id,
                "Status changed from " + previousStatus.name() + " to " + nextStatus.name());
        return response;
    }

    /** Cancels a user's own booking. */
    @Transactional
    public BookingResponse cancelOwnBooking(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));
        if (!booking.getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("You are not authorized to cancel this booking.");
        }
        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Booking is already cancelled.");
        }
        BookingStatus previousStatus = booking.getBookingStatus();
        booking.setBookingStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        notifyBookingCreatorOfStatusChange(saved, previousStatus, BookingStatus.CANCELLED);
        BookingResponse response = toResponse(saved);
        auditLogService.log(userEmail, "CANCEL", "Booking", id, "User cancelled their booking.");
        return response;
    }

    /** Reschedules a booking to a new date/time (admin use). */
    @Transactional
    public BookingResponse reschedule(Long id, RescheduleRequest req, String actorEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        boolean slotTaken = bookingRepository.existsByProgramIdAndBookingDateAndBookingTimeAndBookingStatusNotAndIdNot(
                booking.getProgram().getId(), req.getNewDate(), req.getNewTime(), BookingStatus.CANCELLED, id
        );
        if (slotTaken) {
            throw new SlotUnavailableException("The new time slot is already booked.");
        }
        if (availabilityService.isSlotBlocked(req.getNewDate(), req.getNewTime())) {
            throw new SlotUnavailableException("The new time slot is not available.");
        }

        LocalDate oldDate = booking.getBookingDate();
        String oldTime = booking.getBookingTime();
        String oldSlot = oldDate + " " + oldTime;
        booking.setBookingDate(req.getNewDate());
        booking.setBookingTime(req.getNewTime());
        Booking saved = bookingRepository.save(booking);
        BookingResponse response = toResponse(saved);
        notificationService.send(
                saved.getEmail(),
                "BOOKING_RESCHEDULE",
                "Booking rescheduled",
                "Your booking for " + saved.getProgram().getName() + " has been moved from " + oldSlot
                        + " to " + req.getNewDate() + " " + req.getNewTime() + ".",
                "Booking",
                saved.getId());
        emailService.sendBookingRescheduledEmail(response, oldDate, oldTime);
        auditLogService.log(actorEmail, "RESCHEDULE", "Booking", id,
                "Moved from " + oldSlot + " to " + req.getNewDate() + " " + req.getNewTime());
        return response;
    }

    @Transactional
    public void deleteBooking(Long id, String actorEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));
        attendanceRecordRepository.deleteByBookingId(id);
        playerProgressNoteRepository.deleteByBookingId(id);
        bookingRepository.delete(booking);
        auditLogService.log(actorEmail, "DELETE", "Booking", id,
                "Deleted booking for " + booking.getEmail() + " in " + booking.getProgram().getName());
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

        BookingStatus previousStatus = booking.getBookingStatus();
        booking.setBookingStatus(nextStatus);
        Booking saved = bookingRepository.save(booking);
        notifyBookingCreatorOfStatusChange(saved, previousStatus, nextStatus);

        BookingResponse response = toResponse(saved);
        auditLogService.log(coachEmail, "COACH_UPDATE_STATUS", "Booking", id,
                "Coach changed status from " + previousStatus.name() + " to " + nextStatus.name());
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
                .programId(b.getProgram().getId())
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
                .confirmationEmailAvailable(emailService.isEmailDeliveryAvailable())
                .createdAt(b.getCreatedAt())
                .build();
    }

    private Booking applyBookingDetails(
            Booking booking,
            Long programId,
            LocalDate bookingDate,
            String bookingTime,
            String playerName,
            String playerAge,
            String parentName,
            String email,
            String phone,
            String experienceLevel,
            String notes,
            Long currentBookingId
    ) {
        Program program = programService.getProgramEntityById(programId);
        boolean slotChanged = currentBookingId == null
                || !programId.equals(booking.getProgram().getId())
                || !bookingDate.equals(booking.getBookingDate())
                || !bookingTime.equals(booking.getBookingTime());
        if (slotChanged) {
            boolean slotTaken = currentBookingId == null
                    ? bookingRepository.existsByProgramIdAndBookingDateAndBookingTimeAndBookingStatusNot(
                            programId, bookingDate, bookingTime, BookingStatus.CANCELLED
                    )
                    : bookingRepository.existsByProgramIdAndBookingDateAndBookingTimeAndBookingStatusNotAndIdNot(
                            programId, bookingDate, bookingTime, BookingStatus.CANCELLED, currentBookingId
                    );
            if (slotTaken) {
                throw new SlotUnavailableException("This time slot is already booked. Please choose a different time.");
            }
            if (availabilityService.isSlotBlocked(bookingDate, bookingTime)) {
                throw new SlotUnavailableException("This time slot is not available. Please choose a different time.");
            }
        }

        booking.setProgram(program);
        booking.setBookingDate(bookingDate);
        booking.setBookingTime(bookingTime);
        booking.setPlayerName(playerName);
        booking.setPlayerAge(playerAge);
        booking.setParentName(parentName);
        booking.setEmail(normalizeEmail(email));
        booking.setPhone(phone);
        booking.setExperienceLevel(experienceLevel);
        booking.setNotes(notes);
        return booking;
    }

    private void ensureCoachOwnsBooking(Booking booking, String coachEmail) {
        boolean assignedCoachMatch = booking.getCoachUser() != null
                && booking.getCoachUser().getEmail() != null
                && booking.getCoachUser().getEmail().equalsIgnoreCase(coachEmail);
        boolean legacyOwnerMatch = booking.getCoachUser() == null
                && booking.getEmail() != null
                && booking.getEmail().equalsIgnoreCase(coachEmail);

        if (!assignedCoachMatch && !legacyOwnerMatch) {
            throw new IllegalArgumentException("You are not authorized to manage this session.");
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private void notifyBookingCreatorOfStatusChange(Booking booking, BookingStatus previousStatus, BookingStatus nextStatus) {
        if (previousStatus == nextStatus) {
            return;
        }

        switch (nextStatus) {
            case CONFIRMED, CANCELLED -> {
                BookingResponse response = toResponse(booking);
                notificationService.send(
                        booking.getEmail(),
                        "BOOKING_STATUS",
                        bookingStatusTitle(nextStatus),
                        bookingStatusBody(booking, nextStatus),
                        "Booking",
                        booking.getId()
                );
                emailService.sendBookingStatusUpdate(response);
            }
            default -> {
                // no-op
            }
        }
    }

    private String bookingStatusTitle(BookingStatus status) {
        return switch (status) {
            case CONFIRMED -> "Booking confirmed";
            case CANCELLED -> "Booking cancelled";
            default -> "Booking updated";
        };
    }

    private String bookingStatusBody(Booking booking, BookingStatus status) {
        String sessionLabel = booking.getProgram().getName() + " on " + booking.getBookingDate() + " at " + booking.getBookingTime();
        return switch (status) {
            case CONFIRMED -> "Your booking for " + sessionLabel + " has been confirmed.";
            case CANCELLED -> "Your booking for " + sessionLabel + " has been cancelled.";
            default -> "Your booking for " + sessionLabel + " has been updated.";
        };
    }
}
