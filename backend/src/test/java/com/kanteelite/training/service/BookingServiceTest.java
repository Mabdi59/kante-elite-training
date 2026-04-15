package com.kanteelite.training.service;

import com.kanteelite.training.dto.response.BookingResponse;
import com.kanteelite.training.entity.Booking;
import com.kanteelite.training.entity.Program;
import com.kanteelite.training.enums.BookingStatus;
import com.kanteelite.training.enums.PaymentStatus;
import com.kanteelite.training.repository.AttendanceRecordRepository;
import com.kanteelite.training.repository.BookingRepository;
import com.kanteelite.training.repository.PlayerProgressNoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private ProgramService programService;
    @Mock
    private EmailService emailService;
    @Mock
    private AvailabilityService availabilityService;
    @Mock
    private AuditLogService auditLogService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AttendanceRecordRepository attendanceRecordRepository;
    @Mock
    private PlayerProgressNoteRepository playerProgressNoteRepository;

    @InjectMocks
    private BookingService bookingService;

    private Booking sampleBooking;
    private Program sampleProgram;

    @BeforeEach
    void setUp() {
        sampleProgram = new Program();
        sampleProgram.setId(1L);
        sampleProgram.setName("Elite Training");

        sampleBooking = Booking.builder()
                .id(10L)
                .program(sampleProgram)
                .playerName("Test Player")
                .email("player@example.com")
                .bookingDate(LocalDate.now())
                .bookingTime("10:00")
                .bookingStatus(BookingStatus.CONFIRMED)
                .paymentStatus(PaymentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void getAllBookings_returnsListOfResponses() {
        when(bookingRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(sampleBooking));

        List<BookingResponse> result = bookingService.getAllBookings();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPlayerName()).isEqualTo("Test Player");
        assertThat(result.get(0).getEmail()).isEqualTo("player@example.com");
    }

    @Test
    void getAllBookings_returnsEmptyListWhenNoBookings() {
        when(bookingRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of());

        List<BookingResponse> result = bookingService.getAllBookings();

        assertThat(result).isEmpty();
    }

    @Test
    void getBookingsByEmail_returnsOnlyMatchingEmail() {
        when(bookingRepository.findByEmailIgnoreCaseOrderByCreatedAtDesc("player@example.com"))
                .thenReturn(List.of(sampleBooking));

        List<BookingResponse> result = bookingService.getBookingsByEmail("player@example.com");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmail()).isEqualTo("player@example.com");
    }

    @Test
    void getBookingsByEmail_returnsEmptyListForUnknownEmail() {
        when(bookingRepository.findByEmailIgnoreCaseOrderByCreatedAtDesc("unknown@example.com"))
                .thenReturn(List.of());

        List<BookingResponse> result = bookingService.getBookingsByEmail("unknown@example.com");

        assertThat(result).isEmpty();
    }
}
