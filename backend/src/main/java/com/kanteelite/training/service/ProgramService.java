package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.ParticipantAssignmentRequest;
import com.kanteelite.training.dto.request.ProgramRequest;
import com.kanteelite.training.dto.response.ManagedParticipantResponse;
import com.kanteelite.training.dto.response.ProgramResponse;
import com.kanteelite.training.dto.response.ProgramWorkflowResponse;
import com.kanteelite.training.entity.PlayerProfile;
import com.kanteelite.training.entity.Program;
import com.kanteelite.training.entity.ProgramParticipant;
import com.kanteelite.training.entity.User;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.PlayerProfileRepository;
import com.kanteelite.training.repository.ProgramParticipantRepository;
import com.kanteelite.training.repository.ProgramRepository;
import com.kanteelite.training.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ProgramService {

    private static final List<String> ALLOWED_STATUSES = List.of("UPCOMING", "ACTIVE", "COMPLETED");

    private final ProgramRepository programRepository;
    private final ProgramParticipantRepository programParticipantRepository;
    private final UserRepository userRepository;
    private final PlayerProfileRepository playerProfileRepository;

    @Transactional(readOnly = true)
    public List<ProgramResponse> getAllActivePrograms() {
        return programRepository.findByActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProgramResponse> getAllPrograms() {
        return programRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProgramResponse getProgramById(Long id) {
        return toResponse(getProgramEntityById(id));
    }

    @Transactional(readOnly = true)
    public ProgramResponse getProgramBySlug(String slug) {
        Program program = programRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Program not found: " + slug));
        return toResponse(program);
    }

    @Transactional(readOnly = true)
    public ProgramWorkflowResponse getProgramWorkflow(Long id) {
        Program program = getProgramEntityById(id);
        List<ManagedParticipantResponse> participants = programParticipantRepository.findByProgramIdOrderByCreatedAtAsc(id)
                .stream()
                .map(this::toParticipantResponse)
                .toList();
        long participantCount = participants.size();
        return ProgramWorkflowResponse.builder()
                .program(toResponse(program))
                .participants(participants)
                .participantCount(participantCount)
                .capacityReached(isCapacityReached(program.getCapacity(), participantCount))
                .build();
    }

    public Program getProgramEntityById(Long id) {
        return programRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Program", id));
    }

    @Transactional
    public ProgramResponse createProgram(ProgramRequest req) {
        Program program = Program.builder()
                .name(req.getName())
                .slug(req.getSlug())
                .description(req.getDescription())
                .shortDescription(req.getShortDescription())
                .location(trimToNull(req.getLocation()))
                .startAt(req.getStartAt())
                .endAt(req.getEndAt())
                .capacity(normalizeCapacity(req.getCapacity()))
                .status(normalizeStatus(req.getStatus()))
                .price(req.getPrice())
                .priceLabel(req.getPriceLabel())
                .durationMinutes(req.getDurationMinutes())
                .features(req.getFeatures())
                .icon(req.getIcon())
                .whoItsFor(req.getWhoItsFor())
                .active(req.isActive())
                .displayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0)
                .build();
        return toResponse(programRepository.save(program));
    }

    @Transactional
    public ProgramResponse updateProgram(Long id, ProgramRequest req) {
        Program program = getProgramEntityById(id);
        program.setName(req.getName());
        program.setSlug(req.getSlug());
        program.setDescription(req.getDescription());
        program.setShortDescription(req.getShortDescription());
        program.setLocation(trimToNull(req.getLocation()));
        program.setStartAt(req.getStartAt());
        program.setEndAt(req.getEndAt());
        program.setCapacity(normalizeCapacity(req.getCapacity()));
        program.setStatus(normalizeStatus(req.getStatus()));
        program.setPrice(req.getPrice());
        program.setPriceLabel(req.getPriceLabel());
        program.setDurationMinutes(req.getDurationMinutes());
        program.setFeatures(req.getFeatures());
        program.setIcon(req.getIcon());
        program.setWhoItsFor(req.getWhoItsFor());
        program.setActive(req.isActive());
        if (req.getDisplayOrder() != null) program.setDisplayOrder(req.getDisplayOrder());
        return toResponse(programRepository.save(program));
    }

    @Transactional
    public ManagedParticipantResponse addParticipant(Long programId, ParticipantAssignmentRequest request) {
        Program program = getProgramEntityById(programId);
        long participantCount = programParticipantRepository.countByProgramId(programId);
        if (isCapacityReached(program.getCapacity(), participantCount)) {
            throw new IllegalArgumentException("Program capacity has been reached.");
        }

        ProgramParticipant participant = ProgramParticipant.builder()
                .program(program)
                .build();

        if (request.getUserId() != null) {
            if (programParticipantRepository.existsByProgramIdAndUserId(programId, request.getUserId())) {
                throw new IllegalArgumentException("That user is already in this program.");
            }
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getUserId()));
            participant.setUser(user);
        } else if (request.getPlayerProfileId() != null) {
            if (programParticipantRepository.existsByProgramIdAndPlayerProfileId(programId, request.getPlayerProfileId())) {
                throw new IllegalArgumentException("That player is already in this program.");
            }
            PlayerProfile playerProfile = playerProfileRepository.findById(request.getPlayerProfileId())
                    .orElseThrow(() -> new ResourceNotFoundException("PlayerProfile", request.getPlayerProfileId()));
            participant.setPlayerProfile(playerProfile);
        } else {
            String manualName = trimToNull(request.getManualName());
            String manualEmail = normalizeEmail(request.getManualEmail());
            if (!StringUtils.hasText(manualName) || !StringUtils.hasText(manualEmail)) {
                throw new IllegalArgumentException("Manual participants need both a name and email.");
            }
            participant.setManualName(manualName);
            participant.setManualEmail(manualEmail);
        }

        return toParticipantResponse(programParticipantRepository.save(participant));
    }

    @Transactional
    public void removeParticipant(Long programId, Long participantId) {
        ProgramParticipant participant = programParticipantRepository.findByIdAndProgramId(participantId, programId)
                .orElseThrow(() -> new ResourceNotFoundException("ProgramParticipant", participantId));
        programParticipantRepository.delete(participant);
    }

    @Transactional
    public void deleteProgram(Long id) {
        if (!programRepository.existsById(id)) {
            throw new ResourceNotFoundException("Program", id);
        }
        programRepository.deleteById(id);
    }

    private ProgramResponse toResponse(Program program) {
        List<String> features = program.getFeatures() != null
                ? Arrays.stream(program.getFeatures().split("\\|"))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toList()
                : List.of();
        long participantCount = program.getId() != null
                ? programParticipantRepository.countByProgramId(program.getId())
                : 0;
        return ProgramResponse.builder()
                .id(program.getId())
                .name(program.getName())
                .slug(program.getSlug())
                .description(program.getDescription())
                .shortDescription(program.getShortDescription())
                .location(program.getLocation())
                .startAt(program.getStartAt())
                .endAt(program.getEndAt())
                .capacity(program.getCapacity())
                .status(program.getStatus())
                .participantCount(participantCount)
                .price(program.getPrice())
                .priceLabel(program.getPriceLabel())
                .durationMinutes(program.getDurationMinutes())
                .features(features)
                .icon(program.getIcon())
                .whoItsFor(program.getWhoItsFor())
                .displayOrder(program.getDisplayOrder())
                .build();
    }

    private ManagedParticipantResponse toParticipantResponse(ProgramParticipant participant) {
        if (participant.getUser() != null) {
            return ManagedParticipantResponse.builder()
                    .id(participant.getId())
                    .userId(participant.getUser().getId())
                    .participantType("USER")
                    .name(participant.getUser().getName())
                    .email(participant.getUser().getEmail())
                    .createdAt(participant.getCreatedAt())
                    .build();
        }
        if (participant.getPlayerProfile() != null) {
            User parentUser = participant.getPlayerProfile().getParentUser();
            return ManagedParticipantResponse.builder()
                    .id(participant.getId())
                    .playerProfileId(participant.getPlayerProfile().getId())
                    .participantType("PLAYER")
                    .name(participant.getPlayerProfile().getName())
                    .email(parentUser != null ? parentUser.getEmail() : null)
                    .createdAt(participant.getCreatedAt())
                    .build();
        }
        return ManagedParticipantResponse.builder()
                .id(participant.getId())
                .participantType("MANUAL")
                .name(participant.getManualName())
                .email(participant.getManualEmail())
                .createdAt(participant.getCreatedAt())
                .build();
    }

    private int normalizeCapacity(Integer value) {
        return value != null && value > 0 ? value : 20;
    }

    private boolean isCapacityReached(Integer capacity, long participantCount) {
        return capacity != null && capacity > 0 && participantCount >= capacity;
    }

    private String normalizeStatus(String value) {
        if (!StringUtils.hasText(value)) {
            return "UPCOMING";
        }
        String normalized = value.trim().toUpperCase(Locale.ROOT);
        return ALLOWED_STATUSES.contains(normalized) ? normalized : "UPCOMING";
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String normalizeEmail(String value) {
        String trimmed = trimToNull(value);
        return trimmed == null ? null : trimmed.toLowerCase(Locale.ROOT);
    }
}
