package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.request.AdminUserCreateRequest;
import com.kanteelite.training.dto.request.AdminUserUpdateRequest;
import com.kanteelite.training.dto.response.AdminDashboardResponse;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.AuditLogResponse;
import com.kanteelite.training.dto.response.UserResponse;
import com.kanteelite.training.enums.BookingStatus;
import com.kanteelite.training.enums.TeamRegistrationStatus;
import com.kanteelite.training.enums.UserRole;
import com.kanteelite.training.repository.BookingRepository;
import com.kanteelite.training.repository.CoachProfileRepository;
import com.kanteelite.training.repository.ContactMessageRepository;
import com.kanteelite.training.repository.EventRepository;
import com.kanteelite.training.repository.PlayerProfileRepository;
import com.kanteelite.training.repository.ProgramRepository;
import com.kanteelite.training.repository.TeamRegistrationRepository;
import com.kanteelite.training.repository.TournamentRepository;
import com.kanteelite.training.repository.UserRepository;
import com.kanteelite.training.service.AdminUserService;
import com.kanteelite.training.service.AuditLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
    private final AdminUserService adminUserService;
    private final CoachProfileRepository coachProfileRepository;
    private final PlayerProfileRepository playerProfileRepository;
    private final TeamRegistrationRepository teamRegistrationRepository;

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
                .totalCoaches(coachProfileRepository.countByActiveTrue())
                .totalPlayers(playerProfileRepository.countByActiveTrue())
                .pendingRegistrations(teamRegistrationRepository.countByStatus(TeamRegistrationStatus.PENDING))
                .usersWithRoleAdmin(userRepository.countByRole(UserRole.ADMIN))
                .usersWithRoleCoach(userRepository.countByRole(UserRole.COACH))
                .usersWithRoleUser(userRepository.countByRole(UserRole.USER))
                .build();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(adminUserService.getAllUsers()));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody AdminUserCreateRequest request) {
        UserResponse created = adminUserService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created.", created));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "User updated.",
                adminUserService.updateUser(id, request)));
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(
                "Role updated.",
                adminUserService.updateUserRole(id, body.get("role"))));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted.", null));
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
}
