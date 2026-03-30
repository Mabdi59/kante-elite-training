package com.kanteelite.training.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TournamentRegistrationDashboardResponse {
    private TeamRegistrationResponse registration;
    private boolean paymentRequired;
    private boolean onlinePaymentAvailable;
    private BigDecimal entryFee;
    private boolean rosterSubmitted;
    private String rosterText;
    private String rosterFileName;
    private LocalDateTime rosterSubmittedAt;
    private LocalDateTime lastFollowUpSentAt;
    private String publicAccessUrl;
    private List<String> nextSteps;
}
