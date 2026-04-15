package com.kanteelite.training.service;

import com.kanteelite.training.dto.response.NotificationResponse;
import com.kanteelite.training.entity.Notification;
import com.kanteelite.training.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Notification sampleNotification;

    @BeforeEach
    void setUp() {
        sampleNotification = Notification.builder()
                .id(1L)
                .userEmail("player@test.com")
                .type("BOOKING")
                .title("Booking confirmed")
                .body("Your booking is confirmed.")
                .readStatus(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void send_savesNotificationWithNormalisedEmail() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(sampleNotification);

        notificationService.send("Player@Test.COM", "BOOKING", "Title", "Body", "Booking", 42L);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        assertThat(captor.getValue().getUserEmail()).isEqualTo("player@test.com");
        assertThat(captor.getValue().getEntityId()).isEqualTo(42L);
    }

    @Test
    void getForUser_returnsAllNotifications() {
        when(notificationRepository.findByUserEmailIgnoreCaseOrderByCreatedAtDesc("player@test.com"))
                .thenReturn(List.of(sampleNotification));

        List<NotificationResponse> result = notificationService.getForUser("player@test.com");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Booking confirmed");
    }

    @Test
    void getUnreadCount_returnsCountFromRepository() {
        when(notificationRepository.countByUserEmailIgnoreCaseAndReadStatusFalse("player@test.com"))
                .thenReturn(3L);

        long count = notificationService.getUnreadCount("player@test.com");

        assertThat(count).isEqualTo(3L);
    }

    @Test
    void markAsRead_setsReadStatusTrue() {
        sampleNotification.setReadStatus(false);
        when(notificationRepository.findById(1L)).thenReturn(java.util.Optional.of(sampleNotification));

        notificationService.markAsRead(1L, "player@test.com");

        assertThat(sampleNotification.isReadStatus()).isTrue();
        verify(notificationRepository).save(sampleNotification);
    }

    @Test
    void markAllAsRead_setsReadStatusOnAllUnread() {
        Notification n1 = Notification.builder().id(1L).userEmail("player@test.com").readStatus(false).build();
        Notification n2 = Notification.builder().id(2L).userEmail("player@test.com").readStatus(false).build();
        when(notificationRepository.findByUserEmailIgnoreCaseAndReadStatusFalseOrderByCreatedAtDesc("player@test.com"))
                .thenReturn(List.of(n1, n2));

        notificationService.markAllAsRead("player@test.com");

        assertThat(n1.isReadStatus()).isTrue();
        assertThat(n2.isReadStatus()).isTrue();
        verify(notificationRepository).saveAll(List.of(n1, n2));
    }
}
