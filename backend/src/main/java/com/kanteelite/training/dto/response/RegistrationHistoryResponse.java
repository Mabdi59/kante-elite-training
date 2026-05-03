package com.kanteelite.training.dto.response;

import com.kanteelite.training.enums.RegistrationActorType;
import com.kanteelite.training.enums.RegistrationPaymentStatus;
import com.kanteelite.training.enums.RegistrationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RegistrationHistoryResponse {
    private Long id;
    private String eventType;
    private String message;
    private RegistrationStatus previousStatus;
    private RegistrationStatus newStatus;
    private RegistrationPaymentStatus previousPaymentStatus;
    private RegistrationPaymentStatus newPaymentStatus;
    private RegistrationActorType actorType;
    private String actorLabel;
    private LocalDateTime createdAt;
}
