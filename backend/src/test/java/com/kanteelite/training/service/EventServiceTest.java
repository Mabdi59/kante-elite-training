package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.EventRequest;
import com.kanteelite.training.dto.request.EventParticipationRequest;
import com.kanteelite.training.entity.Event;
import com.kanteelite.training.entity.EventParticipant;
import com.kanteelite.training.repository.EventParticipantRepository;
import com.kanteelite.training.repository.EventRepository;
import com.kanteelite.training.repository.EventScheduleRuleRepository;
import com.kanteelite.training.repository.PlayerProfileRepository;
import com.kanteelite.training.repository.SessionRepository;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock private EventRepository eventRepository;
    @Mock private EventParticipantRepository eventParticipantRepository;
    @Mock private UserRepository userRepository;
    @Mock private PlayerProfileRepository playerProfileRepository;
    @Mock private EventScheduleRuleRepository eventScheduleRuleRepository;
    @Mock private SessionRepository sessionRepository;
    @Mock private SessionGeneratorService sessionGeneratorService;
    @Mock private NotificationService notificationService;
    @Mock private EmailService emailService;

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

        EventParticipant p1 = EventParticipant.builder().event(event).manualName("Alex").manualEmail("alex@test.com").build();
        EventParticipant p2 = EventParticipant.builder().event(event).manualName("Alex Duplicate").manualEmail("alex@test.com").build();
        EventParticipant p3 = EventParticipant.builder().event(event).manualName("Blake").manualEmail("blake@test.com").build();

        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(eventParticipantRepository.findByEventIdOrderByCreatedAtAsc(1L)).thenReturn(List.of(p1, p2, p3));
        when(eventParticipantRepository.countByEventId(1L)).thenReturn(2L);
        when(eventScheduleRuleRepository.findByEventIdOrderByDayOfWeekAscStartTimeAsc(1L)).thenReturn(List.of());

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
        EventParticipant p1 = EventParticipant.builder().event(event).manualName("Alex").manualEmail("alex@test.com").build();

        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(eventParticipantRepository.findByEventIdOrderByCreatedAtAsc(1L)).thenReturn(List.of(p1));

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
        when(eventParticipantRepository.countByEventId(1L)).thenReturn(0L);
        when(eventParticipantRepository.save(any(EventParticipant.class))).thenAnswer(invocation -> {
            EventParticipant participant = invocation.getArgument(0);
            participant.setId(100L);
            return participant;
        });

        eventService.requestParticipation(1L, request);

        verify(notificationService).send(
                eq("casey@test.com"), eq("EVENT_REGISTRATION"), eq("Event registration confirmed"), contains("registered"), eq("Event"), eq(1L));
        verify(emailService).sendEventParticipantEmail(
                eq("casey@test.com"), eq("Casey"), eq("Spring Skills Camp"), eq(true));
    }
}
