package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.AdminUserCreateRequest;
import com.kanteelite.training.dto.request.AdminUserUpdateRequest;
import com.kanteelite.training.dto.response.UserResponse;
import com.kanteelite.training.entity.CoachProfile;
import com.kanteelite.training.entity.PlayerProfile;
import com.kanteelite.training.entity.User;
import com.kanteelite.training.enums.UserRole;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.CoachProfileRepository;
import com.kanteelite.training.repository.PlayerProfileRepository;
import com.kanteelite.training.repository.RefreshTokenRepository;
import com.kanteelite.training.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CoachProfileRepository coachProfileRepository;
    private final PlayerProfileRepository playerProfileRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public UserResponse createUser(AdminUserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        User savedUser = userRepository.save(user);
        ensureCoachProfileIfNeeded(savedUser);
        ensurePlayerProfileIfNeeded(savedUser);
        return toResponse(savedUser);
    }

    @Transactional
    public UserResponse updateUser(Long id, AdminUserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));

        if (userRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User savedUser = userRepository.save(user);
        ensureCoachProfileIfNeeded(savedUser);
        ensurePlayerProfileIfNeeded(savedUser);
        return toResponse(savedUser);
    }

    @Transactional
    public UserResponse updateUserRole(Long id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setRole(UserRole.valueOf(role));
        User savedUser = userRepository.save(user);
        ensureCoachProfileIfNeeded(savedUser);
        ensurePlayerProfileIfNeeded(savedUser);
        return toResponse(savedUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));

        coachProfileRepository.findByUserId(user.getId()).ifPresent(coachProfileRepository::delete);
        playerProfileRepository.deleteByParentUserId(user.getId());
        refreshTokenRepository.revokeAllByUserEmail(user.getEmail());
        userRepository.delete(user);
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private void ensureCoachProfileIfNeeded(User user) {
        if (user.getRole() != UserRole.COACH) {
            return;
        }

        if (coachProfileRepository.findByUserId(user.getId()).isPresent()) {
            return;
        }

        CoachProfile profile = CoachProfile.builder()
                .user(user)
                .bio("")
                .specialties("")
                .certifications("")
                .active(true)
                .build();
        coachProfileRepository.save(profile);
    }

    private void ensurePlayerProfileIfNeeded(User user) {
        if (user.getRole() != UserRole.PLAYER) {
            return;
        }

        if (playerProfileRepository.existsByParentUserIdAndActiveTrue(user.getId())) {
            return;
        }

        PlayerProfile profile = PlayerProfile.builder()
                .parentUser(user)
                .name(user.getName())
                .active(true)
                .build();
        playerProfileRepository.save(profile);
    }
}
