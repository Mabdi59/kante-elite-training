package com.kanteelite.training.repository;

import com.kanteelite.training.entity.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {
    Optional<PaymentRecord> findByStripeSessionId(String stripeSessionId);
    Optional<PaymentRecord> findFirstByRegistrationIdOrderByCreatedAtDesc(Long registrationId);
    List<PaymentRecord> findByRegistrationIdOrderByCreatedAtDesc(Long registrationId);
    void deleteByRegistrationId(Long registrationId);
}
