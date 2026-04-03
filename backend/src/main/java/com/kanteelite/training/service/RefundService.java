package com.kanteelite.training.service;

import com.kanteelite.training.dto.response.BookingResponse;
import com.kanteelite.training.entity.Booking;
import com.kanteelite.training.enums.PaymentStatus;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.BookingRepository;
import com.kanteelite.training.service.payment.stripe.StripePaymentService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Orchestrates booking refunds regardless of whether Stripe is enabled.
 * <p>
 * When a Stripe session ID is present and {@link StripePaymentService} is active,
 * the actual Stripe refund is issued before the booking status is updated.
 * When Stripe is not configured the booking is simply marked REFUNDED.
 */
@Service
@RequiredArgsConstructor
public class RefundService {

    private static final Logger log = LoggerFactory.getLogger(RefundService.class);

    private final BookingRepository bookingRepository;
    private final BookingService bookingService;
    private final AuditLogService auditLogService;
    private final Optional<StripePaymentService> stripePaymentService;

    @Transactional
    public BookingResponse refundBooking(Long bookingId, String actorEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingId));

        if (booking.getPaymentStatus() != PaymentStatus.PAID) {
            throw new IllegalStateException(
                    "Cannot refund booking " + bookingId + ": current status is " + booking.getPaymentStatus());
        }

        if (booking.getStripeSessionId() != null && stripePaymentService.isPresent()) {
            log.info("Issuing Stripe refund for booking {} (session {})", bookingId, booking.getStripeSessionId());
            stripePaymentService.get().refundPayment(booking.getStripeSessionId());
        } else {
            log.info("No Stripe session for booking {} — marking as refunded directly", bookingId);
        }

        booking.setPaymentStatus(PaymentStatus.REFUNDED);
        Booking saved = bookingRepository.save(booking);
        auditLogService.log(actorEmail, "REFUND", "Booking", bookingId, "Booking refunded.");
        return bookingService.toResponse(saved);
    }
}
