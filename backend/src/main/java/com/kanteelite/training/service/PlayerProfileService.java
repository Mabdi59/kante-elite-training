package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.PlayerProfileRequest;
import com.kanteelite.training.dto.response.PlayerProfileResponse;
import com.kanteelite.training.entity.PlayerProfile;
import com.kanteelite.training.entity.User;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.PlayerProfileRepository;
import com.kanteelite.training.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlayerProfileService {

    private final PlayerProfileRepository playerProfileRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<PlayerProfileResponse> getMyPlayers(String parentEmail) {
        return playerProfileRepository.findByParentUserEmailOrderByNameAsc(parentEmail)
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
        PlayerProfile profile = PlayerProfile.builder()
                .parentUser(parent)
                .name(req.getName())
                .dateOfBirth(req.getDateOfBirth())
                .age(req.getAge())
                .skillLevel(req.getSkillLevel())
                .preferredPosition(req.getPreferredPosition())
                .notes(req.getNotes())
                .build();
        return toResponse(playerProfileRepository.save(profile));
    }

    @Transactional
    public PlayerProfileResponse update(Long id, String parentEmail, PlayerProfileRequest req) {
        PlayerProfile profile = playerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PlayerProfile", id));
        if (!profile.getParentUser().getEmail().equalsIgnoreCase(parentEmail)) {
            throw new IllegalArgumentException("You are not authorized to edit this player profile.");
        }
        profile.setName(req.getName());
        profile.setDateOfBirth(req.getDateOfBirth());
        profile.setAge(req.getAge());
        profile.setSkillLevel(req.getSkillLevel());
        profile.setPreferredPosition(req.getPreferredPosition());
        profile.setNotes(req.getNotes());
        return toResponse(playerProfileRepository.save(profile));
    }

    @Transactional
    public void delete(Long id, String parentEmail) {
        PlayerProfile profile = playerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PlayerProfile", id));
        if (!profile.getParentUser().getEmail().equalsIgnoreCase(parentEmail)) {
            throw new IllegalArgumentException("You are not authorized to delete this player profile.");
        }
        profile.setActive(false);
        playerProfileRepository.save(profile);
    }

    private PlayerProfileResponse toResponse(PlayerProfile p) {
        return PlayerProfileResponse.builder()
                .id(p.getId())
                .parentUserId(p.getParentUser().getId())
                .parentUserEmail(p.getParentUser().getEmail())
                .name(p.getName())
                .dateOfBirth(p.getDateOfBirth())
                .age(p.getAge())
                .skillLevel(p.getSkillLevel())
                .preferredPosition(p.getPreferredPosition())
                .notes(p.getNotes())
                .active(p.isActive())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
