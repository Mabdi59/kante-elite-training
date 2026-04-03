package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.ForgotPasswordRequest;
import com.kanteelite.training.dto.request.LoginRequest;
import com.kanteelite.training.dto.request.RegisterRequest;
import com.kanteelite.training.dto.request.ResetPasswordRequest;
import com.kanteelite.training.dto.response.AuthResponse;
import com.kanteelite.training.entity.PasswordResetToken;
import com.kanteelite.training.entity.RefreshToken;
import com.kanteelite.training.entity.User;
import com.kanteelite.training.enums.UserRole;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.PasswordResetTokenRepository;
import com.kanteelite.training.repository.UserRepository;
import com.kanteelite.training.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered.");
        }
        UserRole role = resolveRequestedPublicRole(request.getRequestedRole());
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();
        user = userRepository.save(user);
        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name());
        String refreshToken = refreshTokenService.createRefreshToken(user.getEmail());
        return buildResponse(user, accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }
        if (request.getRequestedRole() == UserRole.TEAM_CAPTAIN
                && (user.getRole() == UserRole.USER || user.getRole() == UserRole.PARENT)) {
            user.setRole(UserRole.TEAM_CAPTAIN);
            user = userRepository.save(user);
        }
        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name());
        String refreshToken = refreshTokenService.createRefreshToken(user.getEmail());
        return buildResponse(user, accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse claimTeamCaptainAccess(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (user.getRole() == UserRole.USER || user.getRole() == UserRole.PARENT) {
            user.setRole(UserRole.TEAM_CAPTAIN);
            user = userRepository.save(user);
        }

        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name());
        String refreshToken = refreshTokenService.createRefreshToken(user.getEmail());
        return buildResponse(user, accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse refreshTokens(String rawRefreshToken) {
        RefreshToken rt = refreshTokenService.validate(rawRefreshToken);
        User user = userRepository.findByEmail(rt.getUserEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        // rotate: revoke old, issue new pair
        refreshTokenService.revoke(rawRefreshToken);
        String newAccessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name());
        String newRefreshToken = refreshTokenService.createRefreshToken(user.getEmail());
        return buildResponse(user, newAccessToken, newRefreshToken);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        refreshTokenService.revoke(rawRefreshToken);
    }

    @Transactional
    public boolean forgotPassword(ForgotPasswordRequest request) {
        boolean emailDeliveryAvailable = emailService.isEmailDeliveryAvailable();
        // Always return 200 to avoid user enumeration
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            // Invalidate old tokens
            passwordResetTokenRepository.invalidateAllByUserEmail(user.getEmail());

            String tokenValue = UUID.randomUUID().toString();
            PasswordResetToken token = PasswordResetToken.builder()
                    .token(tokenValue)
                    .userEmail(user.getEmail())
                    .expiry(LocalDateTime.now().plusHours(1))
                    .build();
            passwordResetTokenRepository.save(token);

            try {
                emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), tokenValue);
            } catch (Exception e) {
                log.warn("Failed to send password reset email to {}: {}", user.getEmail(), e.getMessage());
            }
        });
        return emailDeliveryAvailable;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken prt = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token."));
        if (prt.isUsed()) {
            throw new IllegalArgumentException("Reset token has already been used.");
        }
        if (prt.getExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Reset token has expired.");
        }
        User user = userRepository.findByEmail(prt.getUserEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        prt.setUsed(true);
        passwordResetTokenRepository.save(prt);
        // Revoke all refresh tokens so old sessions are invalidated
        refreshTokenService.revokeAll(user.getEmail());
    }

    @Transactional(readOnly = true)
    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private AuthResponse buildResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .build();
    }

    private UserRole resolveRequestedPublicRole(UserRole requestedRole) {
        if (requestedRole == UserRole.TEAM_CAPTAIN) {
            return UserRole.TEAM_CAPTAIN;
        }
        return UserRole.USER;
    }
}
