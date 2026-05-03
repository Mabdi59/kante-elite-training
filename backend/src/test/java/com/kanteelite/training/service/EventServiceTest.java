package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.EventRequest;
import com.kanteelite.training.dto.request.EventParticipationRequest;
import com.kanteelite.training.dto.response.ManagedParticipantResponse;
import com.kanteelite.training.entity.Event;
import com.kanteelite.training.entity.Registration;
import com.kanteelite.training.enums.RegistrationStatus;
import com.kanteelite.training.repository.EventRepository;
import com.kanteelite.training.repository.PlayerProfileRepository;
import com.kanteelite.training.repository.RegistrationRepository;
import com.kanteelite.training.repository.TrainingSessionRepository;
import com.kanteelite.training.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock private EventRepository eventRepository;
    @Mock private RegistrationRepository registrationRepository;
    @Mock private TrainingSessionRepository trainingSessionRepository;
    @Mock private UserRepository userRepository;
    @Mock private PlayerProfileRepository playerProfileRepository;
    @Mock private NotificationService notificationService;
    @Mock private EmailService emailService;
    @Mock private TrainingSessionService trainingSessionService;

    @InjectMocks
    private EventService eventService;

    private Event event;

    @BeforeEach
    void setUp() {
        event = Event.builder()
                .id(1L)
                .title("Spring Skills Camp")
                .description("Camp")
                .location("Columbus")
                .venue("Field A")
                .startDate(LocalDate.of(2026, 5, 10))
                .endDate(LocalDate.of(2026, 5, 10))
                .capacity(20)
                .price(BigDecimal.valueOf(50))
                .status("UPCOMING")
                .build();
    }

    @Test
    void updateEvent_notifiesParticipantsOncePerEmail() {
        EventRequest request = new EventRequest();
        request.setTitle("Spring Skills Camp Updated");
        request.setDescription("Updated camp");
        request.setLocation("Columbus Indoor");
        request.setVenue("Field B");
        request.setStartDate(LocalDate.of(2026, 5, 11));
        request.setEndDate(LocalDate.of(2026, 5, 11));
        request.setCapacity(24);
        request.setPrice(BigDecimal.valueOf(60));
        request.setStatus("ACTIVE");

        Registration p1 = eventRegistration("Alex", "alex@test.com");
        Registration p2 = eventRegistration("Alex Duplicate", "alex@test.com");
        Registration p3 = eventRegistration("Blake", "blake@test.com");

        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(registrationRepository.findByEventIdOrderByCreatedAtAsc(1L)).thenReturn(List.of(p1, p2, p3));

        eventService.updateEvent(1L, request);

        verify(notificationService, times(1)).send(
                eq("alex@test.com"), eq("EVENT_UPDATE"), eq("Event updated"), contains("updated"), eq("Event"), eq(1L));
        verify(notificationService, times(1)).send(
                eq("blake@test.com"), eq("EVENT_UPDATE"), eq("Event updated"), contains("updated"), eq("Event"), eq(1L));
        verify(emailService, times(1)).sendEventLifecycleEmail(
                eq("alex@test.com"), any(), any(), eq("updated"), contains("updated"));
        verify(emailService, times(1)).sendEventLifecycleEmail(
                eq("blake@test.com"), any(), any(), eq("updated"), contains("updated"));
    }

    @Test
    void deleteEvent_notifiesParticipantsAndDeletesEvent() {
        Registration p1 = eventRegistration("Alex", "alex@test.com");

        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(registrationRepository.findByEventIdOrderByCreatedAtAsc(1L)).thenReturn(List.of(p1));

        eventService.deleteEvent(1L);

        verify(eventRepository).deleteById(1L);
        verify(notificationService).send(
                eq("alex@test.com"), eq("EVENT_UPDATE"), eq("Event cancelled"), contains("cancelled"), eq("Event"), eq(1L));
        verify(emailService).sendEventLifecycleEmail(
                eq("alex@test.com"), any(), any(), eq("cancelled"), contains("cancelled"));
    }

    @Test
    void requestParticipation_sendsImmediateRegistrationNotifications() {
        EventParticipationRequest request = new EventParticipationRequest();
        request.setName("Casey");
        request.setEmail("casey@test.com");

        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(registrationRepository.existsByEventIdAndGuardianEmailIgnoreCaseAndStatusNot(
                1L, "casey@test.com", RegistrationStatus.CANCELLED)).thenReturn(false);
        when(registrationRepository.save(any(Registration.class))).thenAnswer(invocation -> {
            Registration registration = invocation.getArgument(0);
            registration.setId(100L);
            return registration;
        });

        ManagedParticipantResponse response = eventService.requestParticipation(1L, request);

        assertEquals("casey@test.com", response.getEmail());
        verify(notificationService).send(
                eq("casey@test.com"), eq("EVENT_REGISTRATION"), eq("Event registration confirmed"), contains("registered"), eq("Event"), eq(1L));
    }

    private Registration eventRegistration(String name, String email) {
        return Registration.builder()
                .event(event)
                .participantName(name)
                .participantEmail(email)
                .guardianName(name)
                .guardianEmail(email)
                .status(RegistrationStatus.CONFIRMED)
                .createdAt(java.time.LocalDateTime.now())
                .build();
    }
}


