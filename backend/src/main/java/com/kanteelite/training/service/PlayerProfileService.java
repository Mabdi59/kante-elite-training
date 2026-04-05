package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.AdminPlayerProfileRequest;
import com.kanteelite.training.dto.request.PlayerProfileRequest;
import com.kanteelite.training.dto.response.PlayerProfileResponse;
import com.kanteelite.training.entity.PlayerProfile;
import com.kanteelite.training.entity.User;
import com.kanteelite.training.enums.UserRole;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.PlayerProfileRepository;
import com.kanteelite.training.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlayerProfileService {

    private final PlayerProfileRepository playerProfileRepository;
    private final UserRepository userRepository;

    @Transactional
    public List<PlayerProfileResponse> getMyPlayers(String parentEmail) {
        ensurePlayerProfileIfNeeded(parentEmail);
        return playerProfileRepository.findByParentUserEmailAndActiveTrueOrderByNameAsc(parentEmail)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PlayerProfileResponse> getAllPlayers() {
        return playerProfileRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public PlayerProfileResponse create(String parentEmail, PlayerProfileRequest req) {
        User parent = userRepository.findByEmail(parentEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + parentEmail));

        if (parent.getRole() == UserRole.PLAYER
                && playerProfileRepository.existsByParentUserIdAndActiveTrue(parent.getId())) {
            throw new IllegalArgumentException("Player accounts can only manage one active player profile.");
        }

        PlayerProfile profile = PlayerProfile.builder()
                .parentUser(parent)
                .name(req.getName())
                .dateOfBirth(req.getDateOfBirth())
                .age(resolveAge(req.getDateOfBirth(), req.getAge()))
                .skillLevel(req.getSkillLevel())
                .preferredPosition(req.getPreferredPosition())
                .notes(req.getNotes())
                .build();
        return toResponse(playerProfileRepository.save(profile));
    }

    @Transactional
    public PlayerProfileResponse createForAdmin(AdminPlayerProfileRequest req) {
        PlayerProfile profile = PlayerProfile.builder()
                .parentUser(resolveParentUser(req.getParentUserId()))
                .name(req.getName())
                .dateOfBirth(req.getDateOfBirth())
                .age(resolveAge(req.getDateOfBirth(), req.getAge()))
                .skillLevel(req.getSkillLevel())
                .preferredPosition(req.getPreferredPosition())
                .notes(req.getNotes())
                .active(req.getActive() == null || req.getActive())
                .build();
        return toResponse(playerProfileRepository.save(profile));
    }

    @Transactional
    public PlayerProfileResponse update(Long id, String parentEmail, PlayerProfileRequest req) {
        PlayerProfile profile = playerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PlayerProfile", id));
        if (profile.getParentUser() == null
                || !profile.getParentUser().getEmail().equalsIgnoreCase(parentEmail)) {
            throw new IllegalArgumentException("You are not authorized to edit this player profile.");
        }
        profile.setName(req.getName());
        profile.setDateOfBirth(req.getDateOfBirth());
        profile.setAge(resolveAge(req.getDateOfBirth(), req.getAge()));
        profile.setSkillLevel(req.getSkillLevel());
        profile.setPreferredPosition(req.getPreferredPosition());
        profile.setNotes(req.getNotes());
        return toResponse(playerProfileRepository.save(profile));
    }

    @Transactional
    public PlayerProfileResponse updateForAdmin(Long id, AdminPlayerProfileRequest req) {
        PlayerProfile profile = playerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PlayerProfile", id));

        profile.setParentUser(resolveParentUser(req.getParentUserId()));
        profile.setName(req.getName());
        profile.setDateOfBirth(req.getDateOfBirth());
        profile.setAge(resolveAge(req.getDateOfBirth(), req.getAge()));
        profile.setSkillLevel(req.getSkillLevel());
        profile.setPreferredPosition(req.getPreferredPosition());
        profile.setNotes(req.getNotes());
        if (req.getActive() != null) {
            profile.setActive(req.getActive());
        }
        return toResponse(playerProfileRepository.save(profile));
    }

    @Transactional
    public void delete(Long id, String parentEmail) {
        PlayerProfile profile = playerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PlayerProfile", id));
        if (profile.getParentUser() == null
                || !profile.getParentUser().getEmail().equalsIgnoreCase(parentEmail)) {
            throw new IllegalArgumentException("You are not authorized to delete this player profile.");
        }
        profile.setActive(false);
        playerProfileRepository.save(profile);
    }

    @Transactional
    public void deleteForAdmin(Long id) {
        if (!playerProfileRepository.existsById(id)) {
            throw new ResourceNotFoundException("PlayerProfile", id);
        }
        playerProfileRepository.deleteById(id);
    }

    @Transactional
    public void ensurePlayerProfileIfNeeded(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

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

    private PlayerProfileResponse toResponse(PlayerProfile p) {
        return PlayerProfileResponse.builder()
                .id(p.getId())
                .parentUserId(p.getParentUser() != null ? p.getParentUser().getId() : null)
                .parentUserEmail(p.getParentUser() != null ? p.getParentUser().getEmail() : null)
                .name(p.getName())
                .dateOfBirth(p.getDateOfBirth())
                .age(resolveAge(p.getDateOfBirth(), p.getAge()))
                .skillLevel(p.getSkillLevel())
                .preferredPosition(p.getPreferredPosition())
                .notes(p.getNotes())
                .active(p.isActive())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private User resolveParentUser(Long parentUserId) {
        if (parentUserId == null) {
            return null;
        }

        return userRepository.findById(parentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", parentUserId));
    }

    private Integer resolveAge(LocalDate dateOfBirth, Integer fallbackAge) {
        if (dateOfBirth == null) {
            return fallbackAge;
        }

        LocalDate today = LocalDate.now();
        if (dateOfBirth.isAfter(today)) {
            return fallbackAge;
        }

        return Period.between(dateOfBirth, today).getYears();
    }
}
