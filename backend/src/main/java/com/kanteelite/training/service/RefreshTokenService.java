package com.kanteelite.training.service;

import com.kanteelite.training.entity.RefreshToken;
import com.kanteelite.training.repository.RefreshTokenRepository;
import com.kanteelite.training.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;

    @Transactional
    public String createRefreshToken(String userEmail) {
        String tokenValue = jwtUtil.generateOpaqueRefreshToken();
        LocalDateTime expiry = LocalDateTime.now()
                .plusSeconds(jwtUtil.getRefreshTokenExpirationMs() / 1000);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenValue)
                .userEmail(userEmail)
                .expiry(expiry)
                .build();
        refreshTokenRepository.save(refreshToken);
        return tokenValue;
    }

    @Transactional(readOnly = true)
    public RefreshToken validate(String token) {
        RefreshToken rt = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token."));
        if (rt.isRevoked()) {
            throw new IllegalArgumentException("Refresh token has been revoked.");
        }
        if (rt.getExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Refresh token has expired.");
        }
        return rt;
    }

    @Transactional
    public void revokeAll(String userEmail) {
        refreshTokenRepository.revokeAllByUserEmail(userEmail);
    }

    @Transactional
    public void revoke(String token) {
        refreshTokenRepository.findByToken(token).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }
}
