package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.CoachProfileRequest;
import com.kanteelite.training.dto.response.BookingResponse;
import com.kanteelite.training.dto.response.CoachProfileResponse;
import com.kanteelite.training.entity.CoachProfile;
import com.kanteelite.training.entity.User;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.BookingRepository;
import com.kanteelite.training.repository.CoachProfileRepository;
import com.kanteelite.training.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CoachProfileService {

    private final CoachProfileRepository coachProfileRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final BookingService bookingService;

    @Transactional(readOnly = true)
    public List<CoachProfileResponse> getAllCoaches() {
        return coachProfileRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<CoachProfileResponse> getActiveCoaches() {
        return coachProfileRepository.findByActiveTrueOrderByCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CoachProfileResponse getByUserId(Long userId) {
        CoachProfile p = coachProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("CoachProfile for user", userId));
        return toResponse(p);
    }

    @Transactional(readOnly = true)
    public CoachProfileResponse getByUserEmail(String email) {
        CoachProfile p = coachProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No coach profile for: " + email));
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
                .bio(req.getBio())
                .specialties(req.getSpecialties())
                .certifications(req.getCertifications())
                .active(req.isActive())
                .build();
        return toResponse(coachProfileRepository.save(profile));
    }

    @Transactional
    public CoachProfileResponse update(Long id, CoachProfileRequest req) {
        CoachProfile profile = coachProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CoachProfile", id));
        profile.setBio(req.getBio());
        profile.setSpecialties(req.getSpecialties());
        profile.setCertifications(req.getCertifications());
        profile.setActive(req.isActive());
        return toResponse(coachProfileRepository.save(profile));
    }

    @Transactional
    public CoachProfileResponse updateSelf(String email, CoachProfileRequest req) {
        CoachProfile profile = coachProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No coach profile found."));
        profile.setBio(req.getBio());
        profile.setSpecialties(req.getSpecialties());
        profile.setCertifications(req.getCertifications());
        return toResponse(coachProfileRepository.save(profile));
    }

    @Transactional
    public void delete(Long id) {
        if (!coachProfileRepository.existsById(id)) {
            throw new ResourceNotFoundException("CoachProfile", id);
        }
        coachProfileRepository.deleteById(id);
    }

    /** Returns all bookings that involve this coach's email as contact. */
    @Transactional(readOnly = true)
    public List<BookingResponse> getAssignedSessions(String coachEmail) {
        return bookingRepository.findByEmailOrderByCreatedAtDesc(coachEmail)
                .stream().map(bookingService::toResponse).toList();
    }

    private CoachProfileResponse toResponse(CoachProfile p) {
        return CoachProfileResponse.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .userName(p.getUser().getName())
                .userEmail(p.getUser().getEmail())
                .bio(p.getBio())
                .specialties(p.getSpecialties())
                .certifications(p.getCertifications())
                .active(p.isActive())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
