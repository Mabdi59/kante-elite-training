package com.kanteelite.training.service;

import com.kanteelite.training.dto.response.RegistrationResponse;
import com.kanteelite.training.entity.PaymentRecord;
import com.kanteelite.training.entity.Registration;
import com.kanteelite.training.enums.RegistrationPaymentStatus;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.PaymentRecordRepository;
import com.kanteelite.training.repository.RegistrationRepository;
import com.kanteelite.training.service.payment.stripe.StripePaymentService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RefundService {

    private static final Logger log = LoggerFactory.getLogger(RefundService.class);

    private final RegistrationRepository registrationRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final AuditLogService auditLogService;
    private final RegistrationService registrationService;
    private final Optional<StripePaymentService> stripePaymentService;

    @Transactional
    public RegistrationResponse refundRegistration(Long registrationId, String actorEmail) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration", registrationId));

        if (registration.getPaymentStatus() != RegistrationPaymentStatus.PAID) {
            throw new IllegalStateException(
                    "Cannot refund registration " + registrationId + ": current status is "
                            + registration.getPaymentStatus());
        }

        Optional<PaymentRecord> latestRecord = paymentRecordRepository
                .findFirstByRegistrationIdOrderByCreatedAtDesc(registrationId);

        if (latestRecord.isPresent()
                && latestRecord.get().getStripeSessionId() != null
                && stripePaymentService.isPresent()) {
            log.info("Issuing Stripe refund for registration {} (session {})",
                    registrationId, latestRecord.get().getStripeSessionId());
            stripePaymentService.get().refundPayment(latestRecord.get().getStripeSessionId());
        } else {
            log.info("No Stripe payment record for registration {} - marking as refunded directly", registrationId);
        }

        latestRecord.ifPresent(record -> {
            record.setStatus(RegistrationPaymentStatus.REFUNDED);
            record.setAmountRefunded(record.getAmount() != null ? record.getAmount() : java.math.BigDecimal.ZERO);
            record.setRefundedAt(java.time.LocalDateTime.now());
            paymentRecordRepository.save(record);
        });

        RegistrationResponse response = registrationService.updatePaymentStatus(
                registrationId, RegistrationPaymentStatus.REFUNDED, actorEmail);
        auditLogService.log(actorEmail, "REFUND", "Registration", registrationId, "Registration refunded.");
        return response;
    }
}
