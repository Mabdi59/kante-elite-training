package com.kanteelite.training.dto.response;

import com.kanteelite.training.enums.BookingStatus;
import com.kanteelite.training.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponse {
    private Long id;
    private String programName;
    private String programSlug;
    private LocalDate bookingDate;
    private String bookingTime;
    private String playerName;
    private String playerAge;
    private String parentName;
    private String email;
    private String phone;
    private String experienceLevel;
    private String notes;
    private PaymentStatus paymentStatus;
    private BookingStatus bookingStatus;
    private String stripeSessionId;
    private LocalDateTime createdAt;
}
