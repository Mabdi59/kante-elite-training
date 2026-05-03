package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.CoachProfileRequest;
import com.kanteelite.training.dto.response.CoachProfileResponse;
import com.kanteelite.training.entity.CoachProfile;
import com.kanteelite.training.entity.MediaPost;
import com.kanteelite.training.entity.User;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.CoachProfileRepository;
import com.kanteelite.training.repository.MediaPostRepository;
import com.kanteelite.training.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CoachProfileService {

    private final CoachProfileRepository coachProfileRepository;
    private final UserRepository userRepository;
    private final MediaPostRepository mediaPostRepository;

    @Transactional(readOnly = true)
    public List<CoachProfileResponse> getAllCoaches() {
        return coachProfileRepository.findAllByOrderByDisplayOrderAscCreatedAtAsc()
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<CoachProfileResponse> getActiveCoaches() {
        return coachProfileRepository.findByActiveTrueOrderByDisplayOrderAscCreatedAtAsc()
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<CoachProfileResponse> getFeaturedCoaches() {
        return coachProfileRepository.findByActiveTrueAndFeaturedTrueOrderByDisplayOrderAscCreatedAtAsc()
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CoachProfileResponse getByUserId(Long userId) {
        CoachProfile p = coachProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("CoachProfile for user", userId));
        return toResponse(p);
    }

    @Transactional
    public CoachProfileResponse create(Long userId, CoachProfileRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (coachProfileRepository.findByUserId(userId).isPresent()) {
            throw new IllegalArgumentException("A coach profile already exists for this user.");
        }
        CoachProfile profile = CoachProfile.builder()
                .user(user)
                .build();
        applyRequest(profile, req, user.getName());
        return toResponse(coachProfileRepository.save(profile));
    }

    @Transactional
    public CoachProfileResponse createStandalone(CoachProfileRequest req) {
        CoachProfile profile = CoachProfile.builder().build();
        applyRequest(profile, req, null);
        return toResponse(coachProfileRepository.save(profile));
    }

    @Transactional
    public CoachProfileResponse update(Long id, CoachProfileRequest req) {
        CoachProfile profile = coachProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CoachProfile", id));
        applyRequest(profile, req, profile.getUser() != null ? profile.getUser().getName() : null);
        return toResponse(coachProfileRepository.save(profile));
    }

    @Transactional
    public void delete(Long id) {
        if (!coachProfileRepository.existsById(id)) {
            throw new ResourceNotFoundException("CoachProfile", id);
        }
        coachProfileRepository.deleteById(id);
    }

    private CoachProfileResponse toResponse(CoachProfile p) {
        MediaPost headshot = p.getHeadshotMediaPost();
        return CoachProfileResponse.builder()
                .id(p.getId())
                .userId(p.getUser() != null ? p.getUser().getId() : null)
                .userName(p.getUser() != null ? p.getUser().getName() : null)
                .userEmail(p.getUser() != null ? p.getUser().getEmail() : null)
                .displayName(p.getDisplayName())
                .roleTitle(p.getRoleTitle())
                .bio(p.getBio())
                .headshotMediaPostId(headshot != null ? headshot.getId() : null)
                .headshotUrl(headshot != null ? headshot.getMediaUrl() : null)
                .headshotMediaType(headshot != null ? headshot.getMediaType() : null)
                .specialties(p.getSpecialties())
                .certifications(p.getCertifications())
                .instagramUrl(p.getInstagramUrl())
                .websiteUrl(p.getWebsiteUrl())
                .bookingUrl(p.getBookingUrl())
                .featured(p.isFeatured())
                .displayOrder(p.getDisplayOrder())
                .active(p.isActive())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    private void applyRequest(CoachProfile profile, CoachProfileRequest req, String fallbackName) {
        profile.setDisplayName(textOrFallback(req.getDisplayName(), fallbackName != null ? fallbackName : "Kante Elite Coach"));
        profile.setRoleTitle(textOrNull(req.getRoleTitle()));
        profile.setBio(textOrNull(req.getBio()));
        profile.setSpecialties(textOrNull(req.getSpecialties()));
        profile.setCertifications(textOrNull(req.getCertifications()));
        profile.setInstagramUrl(textOrNull(req.getInstagramUrl()));
        profile.setWebsiteUrl(textOrNull(req.getWebsiteUrl()));
        profile.setBookingUrl(textOrNull(req.getBookingUrl()));
        profile.setFeatured(req.isFeatured());
        profile.setDisplayOrder(req.getDisplayOrder() == null ? 0 : req.getDisplayOrder());
        profile.setActive(req.isActive());
        if (req.getHeadshotMediaPostId() != null) {
            profile.setHeadshotMediaPost(mediaPostRepository.findById(req.getHeadshotMediaPostId())
                    .orElseThrow(() -> new ResourceNotFoundException("MediaPost", req.getHeadshotMediaPostId())));
        } else {
            profile.setHeadshotMediaPost(null);
        }
    }

    private String textOrNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String textOrFallback(String value, String fallback) {
        return StringUtils.hasText(value) ? value.trim() : fallback;
    }

}
