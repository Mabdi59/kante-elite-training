package com.kanteelite.training.service;

import com.kanteelite.training.dto.response.TeamRegistrationResponse;
import com.kanteelite.training.dto.response.TournamentPaymentCheckoutResponse;
import com.kanteelite.training.entity.TeamRegistration;
import com.kanteelite.training.enums.PaymentStatus;
import com.kanteelite.training.enums.UserRole;
import com.kanteelite.training.exception.PaymentConfigurationException;
import com.kanteelite.training.exception.PaymentProviderException;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.TeamRegistrationRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TournamentPaymentService {

    private final TeamRegistrationRepository teamRegistrationRepository;
    private final TournamentService tournamentService;
    private final EmailService emailService;
    private final AuditLogService auditLogService;

    @Value("${stripe.secret-key:}")
    private String stripeSecretKey;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.payments.enabled:false}")
    private boolean paymentsEnabled;

    @Transactional
    public TournamentPaymentCheckoutResponse createCheckoutSession(String guestAccessToken) {
        TeamRegistration registration = teamRegistrationRepository.findByGuestAccessToken(guestAccessToken)
                .orElseThrow(() -> new ResourceNotFoundException("Team registration access link not found."));
        String successUrl = buildPortalReturnUrl(registration, "processing");
        String cancelUrl = buildPortalReturnUrl(registration, "cancelled");

        BigDecimal entryFee = registration.getTournament().getEntryFee();
        if (entryFee == null || entryFee.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("This tournament does not require an online payment.");
        }
        if (registration.getPaymentStatus() == PaymentStatus.PAID) {
            throw new IllegalArgumentException("Payment is already complete for this registration.");
        }
        if (!paymentsEnabled || !StringUtils.hasText(stripeSecretKey)) {
            throw new PaymentConfigurationException(
                    "Online card payments are not active right now. Submit your payment method and reference from your Team Portal instead."
            );
        }

        Stripe.apiKey = stripeSecretKey;
        long amountCents = entryFee.multiply(BigDecimal.valueOf(100)).longValue();

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .setCustomerEmail(registration.getTeam().getContactEmail())
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("usd")
                                                .setUnitAmount(amountCents)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(registration.getTournament().getName() + " Entry Fee")
                                                                .setDescription(registration.getTeam().getName() + " tournament registration")
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .putMetadata("checkoutType", "TOURNAMENT_REGISTRATION")
                .putMetadata("registrationId", String.valueOf(registration.getId()))
                .putMetadata("guestAccessToken", guestAccessToken)
                .build();

        try {
            Session session = Session.create(params);
            registration.setPaymentSessionId(session.getId());
            registration.setPaymentReference(session.getId());
            teamRegistrationRepository.save(registration);

            return TournamentPaymentCheckoutResponse.builder()
                    .checkoutUrl(session.getUrl())
                    .message("Redirecting to secure checkout.")
                    .build();
        } catch (StripeException e) {
            throw new PaymentProviderException("Stripe could not create a tournament checkout session.", e);
        }
    }

    @Transactional
    public void handleCompletedCheckout(Session session) {
        TeamRegistration registration = teamRegistrationRepository.findByPaymentSessionId(session.getId())
                .orElseGet(() -> resolveByRegistrationId(session));

        if (registration == null) {
            throw new ResourceNotFoundException("Tournament registration not found for payment session.");
        }
        if (registration.getPaymentStatus() == PaymentStatus.PAID) {
            return;
        }

        registration.setPaymentStatus(PaymentStatus.PAID);
        registration.setPaymentSessionId(session.getId());
        registration.setPaymentReference(session.getPaymentIntent());
        registration.setPaymentPaidAt(LocalDateTime.now());
        registration.setLastFollowUpSentAt(LocalDateTime.now());
        TeamRegistration saved = teamRegistrationRepository.save(registration);

        TeamRegistrationResponse response = tournamentService.toRegResponse(saved);
        emailService.sendTournamentRegistrationUpdate(
                response,
                "Tournament Payment Confirmed, Kante Elite Training",
                "Payment Confirmed",
                "Your tournament payment is confirmed. Your Team Portal now shows this payment as complete.",
                tournamentService.toDashboardResponse(saved).getNextSteps()
        );
        auditLogService.log(saved.getTeam().getContactEmail(), "PAYMENT_CONFIRMED", "TeamRegistration",
                saved.getId(), "Stripe tournament payment completed.");
    }

    private TeamRegistration resolveByRegistrationId(Session session) {
        String registrationId = session.getMetadata() == null ? null : session.getMetadata().get("registrationId");
        if (!StringUtils.hasText(registrationId)) {
            return null;
        }
        return teamRegistrationRepository.findById(Long.parseLong(registrationId)).orElse(null);
    }

    private String buildPortalReturnUrl(TeamRegistration registration, String paymentState) {
        if (registration.getTeam() != null && registration.getTeam().getOwnerUser() != null) {
            if (registration.getTeam().getOwnerUser().getRole() == UserRole.ADMIN) {
                return frontendUrl + "/admin/tournaments";
            }
            return frontendUrl + "/captain/registrations?focus=" + registration.getId() + "&payment=" + paymentState;
        }
        return frontendUrl + "/tournaments/registration/" + registration.getGuestAccessToken() + "?payment=" + paymentState;
    }
}
