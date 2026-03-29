package com.kanteelite.training.service.payment.stripe;

import com.kanteelite.training.dto.request.CheckoutRequest;
import com.kanteelite.training.entity.Booking;
import com.kanteelite.training.entity.Program;
import com.kanteelite.training.enums.BookingStatus;
import com.kanteelite.training.enums.PaymentStatus;
import com.kanteelite.training.exception.PaymentConfigurationException;
import com.kanteelite.training.exception.PaymentProviderException;
import com.kanteelite.training.repository.BookingRepository;
import com.kanteelite.training.service.BookingService;
import com.kanteelite.training.service.EmailService;
import com.kanteelite.training.service.ProgramService;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Stripe-specific payment service.
 * <p>
 * Only activated when {@code app.payments.enabled=true}. Set that flag and provide
 * {@code STRIPE_SECRET_KEY} / {@code STRIPE_WEBHOOK_SECRET} environment variables
 * before enabling.
 */
@Service
@ConditionalOnProperty(name = "app.payments.enabled", havingValue = "true")
public class StripePaymentService {

    private static final Logger log = LoggerFactory.getLogger(StripePaymentService.class);

    private final BookingRepository bookingRepository;
    private final ProgramService programService;
    private final EmailService emailService;
    private final BookingService bookingService;

    @Value("${stripe.secret-key:}")
    private String stripeSecretKey;

    @Value("${stripe.webhook-secret:}")
    private String webhookSecret;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public StripePaymentService(
            BookingRepository bookingRepository,
            ProgramService programService,
            EmailService emailService,
            BookingService bookingService) {
        this.bookingRepository = bookingRepository;
        this.programService = programService;
        this.emailService = emailService;
        this.bookingService = bookingService;
    }

    /**
     * Creates a Stripe Checkout Session for the given booking request.
     */
    public String createCheckoutSession(CheckoutRequest request) {
        if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
            throw new PaymentConfigurationException(
                    "Payments are not configured on the backend. Set STRIPE_SECRET_KEY and try again."
            );
        }

        Stripe.apiKey = stripeSecretKey;

        Program program = programService.getProgramEntityById(request.getProgramId());
        long amountCents = program.getPrice().multiply(java.math.BigDecimal.valueOf(100)).longValue();

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(frontendUrl + "/book/success?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(frontendUrl + "/book?cancelled=true")
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("usd")
                                                .setUnitAmount(amountCents)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(program.getName())
                                                                .setDescription(program.getShortDescription())
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .putMetadata("programId", String.valueOf(request.getProgramId()))
                .putMetadata("bookingDate", request.getBookingDate().toString())
                .putMetadata("bookingTime", request.getBookingTime())
                .putMetadata("playerName", request.getPlayerName())
                .putMetadata("playerAge", orEmpty(request.getPlayerAge()))
                .putMetadata("parentName", orEmpty(request.getParentName()))
                .putMetadata("email", request.getEmail())
                .putMetadata("phone", request.getPhone())
                .putMetadata("experienceLevel", orEmpty(request.getExperienceLevel()))
                .putMetadata("notes", orEmpty(request.getNotes()))
                .setCustomerEmail(request.getEmail())
                .build();

        try {
            Session session = Session.create(params);
            return session.getUrl();
        } catch (StripeException e) {
            throw new PaymentProviderException("Stripe could not create a checkout session.", e);
        }
    }

    /**
     * Handles incoming Stripe webhook events.
     * Primary path for confirming bookings when Stripe payments are active.
     */
    @Transactional
    public void handleWebhook(String payload, String sigHeader) throws SignatureVerificationException {
        Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

        if ("checkout.session.completed".equals(event.getType())) {
            EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
            Optional<StripeObject> stripeObject = deserializer.getObject();

            if (stripeObject.isPresent()) {
                Session session = (Session) stripeObject.get();
                processCompletedCheckout(session);
            } else {
                log.warn("Failed to deserialize Stripe session from webhook event {}", event.getId());
            }
        }
    }

    private void processCompletedCheckout(Session session) {
        String sessionId = session.getId();

        // Idempotency check — don't create duplicate bookings
        if (bookingRepository.findByStripeSessionId(sessionId).isPresent()) {
            log.info("Booking already exists for Stripe session {}. Skipping.", sessionId);
            return;
        }

        try {
            java.util.Map<String, String> meta = session.getMetadata();
            Long programId = Long.parseLong(meta.get("programId"));
            Program program = programService.getProgramEntityById(programId);

            Booking booking = Booking.builder()
                    .program(program)
                    .bookingDate(java.time.LocalDate.parse(meta.get("bookingDate")))
                    .bookingTime(meta.get("bookingTime"))
                    .playerName(meta.get("playerName"))
                    .playerAge(meta.get("playerAge"))
                    .parentName(meta.get("parentName"))
                    .email(meta.get("email"))
                    .phone(meta.get("phone"))
                    .experienceLevel(meta.get("experienceLevel"))
                    .notes(meta.get("notes"))
                    .paymentStatus(PaymentStatus.PAID)
                    .bookingStatus(BookingStatus.CONFIRMED)
                    .stripeSessionId(sessionId)
                    .build();

            Booking saved = bookingRepository.save(booking);
            emailService.sendBookingConfirmation(bookingService.toResponse(saved));
            log.info("Booking confirmed for Stripe session {}", sessionId);
        } catch (Exception e) {
            log.error("Failed to create booking from webhook for session {}: {}", sessionId, e.getMessage(), e);
            throw new RuntimeException("Failed to process booking from webhook", e);
        }
    }

    private String orEmpty(String value) {
        return value != null ? value : "";
    }
}
