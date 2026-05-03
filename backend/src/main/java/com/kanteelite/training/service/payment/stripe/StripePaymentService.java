package com.kanteelite.training.service.payment.stripe;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kanteelite.training.dto.request.CheckoutRequest;
import com.kanteelite.training.entity.PaymentRecord;
import com.kanteelite.training.entity.Program;
import com.kanteelite.training.entity.Registration;
import com.kanteelite.training.enums.RegistrationActorType;
import com.kanteelite.training.enums.RegistrationPaymentStatus;
import com.kanteelite.training.exception.PaymentConfigurationException;
import com.kanteelite.training.exception.PaymentProviderException;
import com.kanteelite.training.repository.PaymentRecordRepository;
import com.kanteelite.training.repository.RegistrationRepository;
import com.kanteelite.training.service.RegistrationService;
import com.kanteelite.training.service.TournamentPaymentService;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.Refund;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.RefundCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

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
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final PaymentRecordRepository paymentRecordRepository;
    private final RegistrationRepository registrationRepository;
    private final RegistrationService registrationService;
    private final TournamentPaymentService tournamentPaymentService;

    @Value("${stripe.secret-key:}")
    private String stripeSecretKey;

    @Value("${stripe.webhook-secret:}")
    private String webhookSecret;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public StripePaymentService(
            PaymentRecordRepository paymentRecordRepository,
            RegistrationRepository registrationRepository,
            RegistrationService registrationService,
            TournamentPaymentService tournamentPaymentService) {
        this.paymentRecordRepository = paymentRecordRepository;
        this.registrationRepository = registrationRepository;
        this.registrationService = registrationService;
        this.tournamentPaymentService = tournamentPaymentService;
    }

    /**
     * Creates a Stripe Checkout Session for a program registration request.
     */
    public String createCheckoutSession(CheckoutRequest request) {
        if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
            throw new PaymentConfigurationException(
                    "Payments are not configured on the backend. Set STRIPE_SECRET_KEY and try again."
            );
        }

        Stripe.apiKey = stripeSecretKey;

        Registration registration = registrationService.createPendingCheckoutRegistration(request);
        Program program = registration.getProgram();
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
                .putMetadata("registrationId", String.valueOf(registration.getId()))
                .putMetadata("checkoutType", "PROGRAM_REGISTRATION")
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
            paymentRecordRepository.save(PaymentRecord.builder()
                    .registration(registration)
                    .provider("STRIPE")
                    .stripeSessionId(session.getId())
                    .amount(program.getPrice())
                    .amountRefunded(java.math.BigDecimal.ZERO)
                    .currency("USD")
                    .status(RegistrationPaymentStatus.PENDING)
                    .checkoutUrl(session.getUrl())
                    .build());
            return session.getUrl();
        } catch (StripeException e) {
            registrationService.updatePaymentStatus(
                    registration.getId(),
                    RegistrationPaymentStatus.UNPAID,
                    "stripe-checkout");
            registrationService.cancelRegistration(
                    registration.getId(),
                    "Stripe checkout could not be created.",
                    "stripe-checkout",
                    RegistrationActorType.SYSTEM);
            throw new PaymentProviderException("Stripe could not create a checkout session.", e);
        }
    }

    /**
     * Handles incoming Stripe webhook events.
     * Primary path for confirming registrations when Stripe payments are active.
     */
    @Transactional
    public void handleWebhook(String payload, String sigHeader) throws SignatureVerificationException {
        Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

        if ("checkout.session.completed".equals(event.getType()) || "checkout.session.expired".equals(event.getType())) {
            EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
            Optional<StripeObject> stripeObject = deserializer.getObject();

            if (stripeObject.isPresent()) {
                Session session = (Session) stripeObject.get();
                if ("checkout.session.completed".equals(event.getType())) {
                    processCompletedCheckout(session);
                } else {
                    processExpiredCheckout(session);
                }
            } else {
                CheckoutSessionSnapshot snapshot = resolveCheckoutSessionSnapshot(payload, event.getId());
                if ("checkout.session.completed".equals(event.getType())) {
                    processCompletedCheckout(snapshot);
                } else {
                    processExpiredCheckout(snapshot);
                }
            }
        }
    }

    private void processCompletedCheckout(Session session) {
        processCompletedCheckout(new CheckoutSessionSnapshot(
                session.getId(),
                session.getPaymentIntent(),
                session.getMetadata()));
    }

    private void processCompletedCheckout(CheckoutSessionSnapshot snapshot) {
        String sessionId = snapshot.id();
        Map<String, String> meta = snapshot.metadata();

        if (meta != null && "TOURNAMENT_REGISTRATION".equals(meta.get("checkoutType"))) {
            Session session = retrieveSession(sessionId).orElseThrow(() ->
                    new IllegalStateException("Stripe tournament session could not be retrieved: " + sessionId));
            tournamentPaymentService.handleCompletedCheckout(session);
            log.info("Tournament registration payment confirmed for Stripe session {}", sessionId);
            return;
        }

        if (meta != null && "PROGRAM_REGISTRATION".equals(meta.get("checkoutType"))) {
            processCompletedRegistrationCheckout(snapshot, meta);
            return;
        }

        log.warn("Ignoring unsupported Stripe checkout session {} with metadata {}", sessionId, meta);
    }

    private void processCompletedRegistrationCheckout(CheckoutSessionSnapshot snapshot, Map<String, String> meta) {
        String sessionId = snapshot.id();
        PaymentRecord paymentRecord = paymentRecordRepository.findByStripeSessionId(sessionId)
                .orElseGet(() -> {
                    Long registrationId = Long.parseLong(meta.get("registrationId"));
                    Registration registration = registrationRepository.findById(registrationId)
                            .orElseThrow(() -> new IllegalStateException(
                                    "Registration not found for Stripe session " + sessionId));
                    return PaymentRecord.builder()
                            .registration(registration)
                            .provider("STRIPE")
                            .stripeSessionId(sessionId)
                            .amount(registration.getPriceAmount())
                            .amountRefunded(java.math.BigDecimal.ZERO)
                            .currency(registration.getCurrency() != null ? registration.getCurrency() : "USD")
                            .status(RegistrationPaymentStatus.PENDING)
                            .build();
                });

        if (paymentRecord.getStatus() == RegistrationPaymentStatus.PAID) {
            log.info("Registration payment already recorded for Stripe session {}. Skipping.", sessionId);
            return;
        }

        paymentRecord.setPaymentIntentId(snapshot.paymentIntentId());
        paymentRecord.setStatus(RegistrationPaymentStatus.PAID);
        paymentRecord.setPaidAt(java.time.LocalDateTime.now());
        paymentRecordRepository.save(paymentRecord);
        registrationService.markStripeCheckoutPaid(
                paymentRecord.getRegistration().getId(),
                sessionId,
                snapshot.paymentIntentId());
        log.info("Registration payment confirmed for Stripe session {}", sessionId);
    }

    private void processExpiredCheckout(Session session) {
        processExpiredCheckout(new CheckoutSessionSnapshot(
                session.getId(),
                session.getPaymentIntent(),
                session.getMetadata()));
    }

    private void processExpiredCheckout(CheckoutSessionSnapshot snapshot) {
        Map<String, String> meta = snapshot.metadata();
        if (meta == null || !"PROGRAM_REGISTRATION".equals(meta.get("checkoutType"))) {
            return;
        }
        paymentRecordRepository.findByStripeSessionId(snapshot.id()).ifPresent(record -> {
            if (record.getStatus() == RegistrationPaymentStatus.PAID) {
                return;
            }
            record.setStatus(RegistrationPaymentStatus.UNPAID);
            paymentRecordRepository.save(record);
            registrationService.updatePaymentStatus(
                    record.getRegistration().getId(),
                    RegistrationPaymentStatus.UNPAID,
                    "stripe-webhook");
            registrationService.cancelRegistration(
                    record.getRegistration().getId(),
                    "Stripe checkout expired before payment completed.",
                    "stripe-webhook",
                    RegistrationActorType.SYSTEM);
            log.info("Expired Stripe checkout released registration {}", record.getRegistration().getId());
        });
    }

    private CheckoutSessionSnapshot resolveCheckoutSessionSnapshot(String payload, String eventId) {
        CheckoutSessionSnapshot rawSnapshot = parseCheckoutSessionSnapshot(payload)
                .orElseThrow(() -> new IllegalStateException(
                        "Stripe checkout session could not be parsed from webhook event " + eventId));
        return retrieveSession(rawSnapshot.id())
                .map(session -> new CheckoutSessionSnapshot(
                        session.getId(),
                        firstPresent(session.getPaymentIntent(), rawSnapshot.paymentIntentId()),
                        mergeMetadata(rawSnapshot.metadata(), session.getMetadata())))
                .orElse(rawSnapshot);
    }

    private Optional<CheckoutSessionSnapshot> parseCheckoutSessionSnapshot(String payload) {
        try {
            JsonNode object = OBJECT_MAPPER.readTree(payload).path("data").path("object");
            String id = textOrNull(object.path("id"));
            if (id == null) {
                return Optional.empty();
            }
            Map<String, String> metadata = new HashMap<>();
            JsonNode metadataNode = object.path("metadata");
            if (metadataNode.isObject()) {
                metadataNode.fields().forEachRemaining(entry -> metadata.put(entry.getKey(), entry.getValue().asText()));
            }
            return Optional.of(new CheckoutSessionSnapshot(
                    id,
                    textOrNull(object.path("payment_intent")),
                    metadata));
        } catch (Exception e) {
            log.warn("Failed to parse raw Stripe checkout session payload: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private Optional<Session> retrieveSession(String sessionId) {
        if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
            return Optional.empty();
        }
        Stripe.apiKey = stripeSecretKey;
        try {
            return Optional.of(Session.retrieve(sessionId));
        } catch (StripeException e) {
            log.warn("Could not retrieve Stripe checkout session {}: {}", sessionId, e.getMessage());
            return Optional.empty();
        }
    }

    private Map<String, String> mergeMetadata(Map<String, String> raw, Map<String, String> retrieved) {
        Map<String, String> merged = new HashMap<>();
        if (raw != null) {
            merged.putAll(raw);
        }
        if (retrieved != null) {
            merged.putAll(retrieved);
        }
        return merged;
    }

    private String textOrNull(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }
        String value = node.asText();
        return value == null || value.isBlank() ? null : value;
    }

    private String firstPresent(String first, String fallback) {
        return first != null && !first.isBlank() ? first : fallback;
    }

    /**
     * Issues a full Stripe refund for the given session ID.
     * The caller is responsible for validating state and persisting changes.
     */
    public void refundPayment(String stripeSessionId) {
        if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
            throw new PaymentConfigurationException(
                    "Stripe is not configured on the backend. Set STRIPE_SECRET_KEY and try again."
            );
        }
        Stripe.apiKey = stripeSecretKey;
        try {
            Session session = Session.retrieve(stripeSessionId);
            String paymentIntentId = session.getPaymentIntent();
            Refund.create(RefundCreateParams.builder().setPaymentIntent(paymentIntentId).build());
        } catch (StripeException e) {
            throw new PaymentProviderException("Stripe refund failed.", e);
        }
    }

    private String orEmpty(String value) {
        return value != null ? value : "";
    }

    private record CheckoutSessionSnapshot(
            String id,
            String paymentIntentId,
            Map<String, String> metadata
    ) {
    }
}
