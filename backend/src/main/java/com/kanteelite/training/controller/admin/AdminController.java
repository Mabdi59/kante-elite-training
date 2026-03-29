package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.response.AdminDashboardResponse;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.AuditLogResponse;
import com.kanteelite.training.dto.response.UserResponse;
import com.kanteelite.training.entity.User;
import com.kanteelite.training.enums.BookingStatus;
import com.kanteelite.training.repository.BookingRepository;
import com.kanteelite.training.repository.ContactMessageRepository;
import com.kanteelite.training.repository.EventRepository;
import com.kanteelite.training.repository.ProgramRepository;
import com.kanteelite.training.repository.TournamentRepository;
import com.kanteelite.training.repository.UserRepository;
import com.kanteelite.training.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final BookingRepository bookingRepository;
    private final ProgramRepository programRepository;
    private final EventRepository eventRepository;
    private final TournamentRepository tournamentRepository;
    private final UserRepository userRepository;
    private final ContactMessageRepository contactMessageRepository;
    private final AuditLogService auditLogService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboard() {
        AdminDashboardResponse stats = AdminDashboardResponse.builder()
                .totalBookings(bookingRepository.count())
                .confirmedBookings(bookingRepository.countByBookingStatus(BookingStatus.CONFIRMED))
                .pendingBookings(bookingRepository.countByBookingStatus(BookingStatus.RESERVED))
                .cancelledBookings(bookingRepository.countByBookingStatus(BookingStatus.CANCELLED))
                .totalPrograms(programRepository.count())
                .activePrograms(programRepository.findByActiveTrueOrderByDisplayOrderAsc().size())
                .totalEvents(eventRepository.count())
                .totalTournaments(tournamentRepository.count())
                .totalUsers(userRepository.count())
                .unreadMessages(contactMessageRepository.countByReadStatusFalse())
                .build();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = userRepository.findAll()
                .stream().map(this::toUserResponse).toList();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAuditLogs() {
        List<AuditLogResponse> logs = auditLogService.getRecent()
                .stream().map(l -> AuditLogResponse.builder()
                        .id(l.getId())
                        .userEmail(l.getUserEmail())
                        .action(l.getAction())
                        .entity(l.getEntity())
                        .entityId(l.getEntityId())
                        .details(l.getDetails())
                        .createdAt(l.getCreatedAt())
                        .build())
                .toList();
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    private UserResponse toUserResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .role(u.getRole().name())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
