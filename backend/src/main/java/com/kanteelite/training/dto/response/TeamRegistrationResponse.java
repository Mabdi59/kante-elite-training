package com.kanteelite.training.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TeamRegistrationResponse {
    private Long id;
    private Long tournamentId;
    private String tournamentName;
    private String tournamentLocation;
    private LocalDate tournamentStartDate;
    private LocalDate tournamentEndDate;
    private String tournamentStatus;
    private Long teamId;
    private String teamName;
    private String captainName;
    private String contactEmail;
    private String phone;
    private String clubName;
    private String status;
    private String paymentStatus;
    private String paymentMethod;
    private String paymentReference;
    private String paymentNotes;
    private BigDecimal entryFee;
    private boolean paymentRequired;
    private boolean rosterSubmitted;
    private String rosterText;
    private String rosterFileName;
    private LocalDateTime rosterSubmittedAt;
    private String guestAccessToken;
    private String publicAccessUrl;
    private LocalDateTime createdAt;
}
