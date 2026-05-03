package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.ParticipantAssignmentRequest;
import com.kanteelite.training.dto.request.ProgramRequest;
import com.kanteelite.training.dto.response.ManagedParticipantResponse;
import com.kanteelite.training.dto.response.ProgramResponse;
import com.kanteelite.training.dto.response.ProgramWorkflowResponse;
import com.kanteelite.training.entity.Program;
import com.kanteelite.training.entity.MediaPost;
import com.kanteelite.training.enums.RegistrationActorType;
import com.kanteelite.training.enums.RegistrationOfferingType;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.ProgramRepository;
import com.kanteelite.training.repository.MediaPostRepository;
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
    private final MediaPostRepository mediaPostRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final RegistrationService registrationService;

    @Transactional(readOnly = true)
    public List<ProgramResponse> getAllActivePrograms() {
        return programRepository.findByActiveTrueOrderByDisplayOrderAscCreatedAtAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProgramResponse> getAllPrograms() {
        return programRepository.findAllByOrderByDisplayOrderAscCreatedAtAsc()
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
        List<ManagedParticipantResponse> participants = registrationService.getProgramParticipants(id);
        long participantCount = participants.size();
        return ProgramWorkflowResponse.builder()
                .program(toResponse(program))
                .participants(participants)
                .participantCount(participantCount)
                .capacityReached(isCapacityReached(program.getCapacity(), registrationService.countProgramRoster(id)))
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
                .category(trimToNull(req.getCategory()))
                .mediaPost(resolveMediaPost(req.getMediaPostId()))
                .secondaryMediaPost(resolveMediaPost(req.getSecondaryMediaPostId()))
                .coachNames(req.getCoachNames())
                .seasonLabel(trimToNull(req.getSeasonLabel()))
                .campaignLabel(trimToNull(req.getCampaignLabel()))
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
                .ctaLabel(trimToNull(req.getCtaLabel()))
                .ctaUrl(trimToNull(req.getCtaUrl()))
                .featured(req.isFeatured())
                .active(req.isActive())
                .allowWaitlist(req.isAllowWaitlist())
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
        program.setCategory(trimToNull(req.getCategory()));
        program.setMediaPost(resolveMediaPost(req.getMediaPostId()));
        program.setSecondaryMediaPost(resolveMediaPost(req.getSecondaryMediaPostId()));
        program.setCoachNames(req.getCoachNames());
        program.setSeasonLabel(trimToNull(req.getSeasonLabel()));
        program.setCampaignLabel(trimToNull(req.getCampaignLabel()));
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
        program.setCtaLabel(trimToNull(req.getCtaLabel()));
        program.setCtaUrl(trimToNull(req.getCtaUrl()));
        program.setFeatured(req.isFeatured());
        program.setActive(req.isActive());
        program.setAllowWaitlist(req.isAllowWaitlist());
        if (req.getDisplayOrder() != null) program.setDisplayOrder(req.getDisplayOrder());
        return toResponse(programRepository.save(program));
    }

    @Transactional
    public ManagedParticipantResponse addParticipant(Long programId, ParticipantAssignmentRequest request) {
        ManagedParticipantResponse response = registrationService.createAdminEntryFromAssignment(
                RegistrationOfferingType.PROGRAM, programId, request, "admin");
        Program program = getProgramEntityById(programId);
        notifyParticipantAssignment(program, response, true);
        return response;
    }

    @Transactional
    public void removeParticipant(Long programId, Long participantId) {
        ManagedParticipantResponse participantResponse = registrationService.getProgramParticipants(programId).stream()
                .filter(p -> p.getId().equals(participantId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Registration", participantId));
        Program program = getProgramEntityById(programId);
        registrationService.cancelRegistration(participantId, "Removed from program roster.", "admin", RegistrationActorType.ADMIN);
        notifyParticipantAssignment(program, participantResponse, false);
    }

    @Transactional
    public void deleteProgram(Long id) {
        if (!programRepository.existsById(id)) {
            throw new ResourceNotFoundException("Program", id);
        }
        programRepository.deleteById(id);
    }

    private ProgramResponse toResponse(Program program) {
        MediaPost mediaPost = program.getMediaPost();
        MediaPost secondaryMediaPost = program.getSecondaryMediaPost();
        List<String> features = program.getFeatures() != null
                ? Arrays.stream(program.getFeatures().split("\\|"))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toList()
                : List.of();
        List<String> coachNames = program.getCoachNames() != null
                ? Arrays.stream(program.getCoachNames().split("\\|"))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toList()
                : List.of();
        long participantCount = program.getId() != null
                ? registrationService.countProgramRoster(program.getId())
                : 0;
        return ProgramResponse.builder()
                .id(program.getId())
                .name(program.getName())
                .slug(program.getSlug())
                .description(program.getDescription())
                .shortDescription(program.getShortDescription())
                .category(program.getCategory())
                .mediaPostId(mediaPost != null ? mediaPost.getId() : null)
                .mediaUrl(mediaPost != null ? mediaPost.getMediaUrl() : null)
                .mediaType(mediaPost != null ? mediaPost.getMediaType() : null)
                .secondaryMediaPostId(secondaryMediaPost != null ? secondaryMediaPost.getId() : null)
                .secondaryMediaUrl(secondaryMediaPost != null ? secondaryMediaPost.getMediaUrl() : null)
                .secondaryMediaType(secondaryMediaPost != null ? secondaryMediaPost.getMediaType() : null)
                .coachNames(coachNames)
                .seasonLabel(program.getSeasonLabel())
                .campaignLabel(program.getCampaignLabel())
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
                .ctaLabel(program.getCtaLabel())
                .ctaUrl(program.getCtaUrl())
                .featured(program.isFeatured())
                .active(program.isActive())
                .allowWaitlist(program.isAllowWaitlist())
                .displayOrder(program.getDisplayOrder())
                .build();
    }

    private MediaPost resolveMediaPost(Long mediaPostId) {
        if (mediaPostId == null) return null;
        return mediaPostRepository.findById(mediaPostId)
                .orElseThrow(() -> new ResourceNotFoundException("MediaPost", mediaPostId));
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

    private void notifyParticipantAssignment(Program program, ManagedParticipantResponse participant, boolean added) {
        if (!StringUtils.hasText(participant.getEmail())) {
            return;
        }

        String title = added ? "Program assignment confirmed" : "Program assignment removed";
        String body = added
                ? "You have been added to " + program.getName() + "."
                : "You have been removed from " + program.getName() + ".";

        notificationService.send(
                participant.getEmail(),
                "PROGRAM_ASSIGNMENT",
                title,
                body,
                "Program",
                program.getId());

        emailService.sendProgramParticipantEmail(
                participant.getEmail(),
                participant.getName(),
                program.getName(),
                added);
    }
}
