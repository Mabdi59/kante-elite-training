package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.TestimonialRequest;
import com.kanteelite.training.dto.response.TestimonialResponse;
import com.kanteelite.training.entity.CoachProfile;
import com.kanteelite.training.entity.MediaPost;
import com.kanteelite.training.entity.Program;
import com.kanteelite.training.entity.Testimonial;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.CoachProfileRepository;
import com.kanteelite.training.repository.MediaPostRepository;
import com.kanteelite.training.repository.ProgramRepository;
import com.kanteelite.training.repository.TestimonialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TestimonialService {

    private final TestimonialRepository testimonialRepository;
    private final MediaPostRepository mediaPostRepository;
    private final ProgramRepository programRepository;
    private final CoachProfileRepository coachProfileRepository;

    @Transactional(readOnly = true)
    public List<TestimonialResponse> getAllTestimonials() {
        return testimonialRepository.findByActiveTrueOrderByDisplayOrderAscCreatedAtAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TestimonialResponse> getAllAdminTestimonials() {
        return testimonialRepository.findAllByOrderByDisplayOrderAscCreatedAtAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TestimonialResponse> getFeaturedTestimonials() {
        return testimonialRepository.findByActiveTrueAndFeaturedTrueOrderByDisplayOrderAscCreatedAtAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TestimonialResponse createTestimonial(TestimonialRequest req) {
        Testimonial t = Testimonial.builder()
                .name(trimToNull(req.getName()))
                .roleOrContext(trimToNull(req.getRoleOrContext()))
                .storyTitle(trimToNull(req.getStoryTitle()))
                .quote(trimToNull(req.getQuote()))
                .mediaPost(resolveMediaPost(req.getMediaPostId()))
                .playerMetadata(trimToNull(req.getPlayerMetadata()))
                .teamMetadata(trimToNull(req.getTeamMetadata()))
                .program(resolveProgram(req.getProgramId()))
                .coachProfile(resolveCoachProfile(req.getCoachProfileId()))
                .rating(req.getRating() != null ? req.getRating() : 5)
                .featured(req.isFeatured())
                .active(req.isActive())
                .displayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0)
                .build();
        return toResponse(testimonialRepository.save(t));
    }

    @Transactional
    public TestimonialResponse updateTestimonial(Long id, TestimonialRequest req) {
        Testimonial t = testimonialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Testimonial", id));
        t.setName(trimToNull(req.getName()));
        t.setRoleOrContext(trimToNull(req.getRoleOrContext()));
        t.setStoryTitle(trimToNull(req.getStoryTitle()));
        t.setQuote(trimToNull(req.getQuote()));
        t.setMediaPost(resolveMediaPost(req.getMediaPostId()));
        t.setPlayerMetadata(trimToNull(req.getPlayerMetadata()));
        t.setTeamMetadata(trimToNull(req.getTeamMetadata()));
        t.setProgram(resolveProgram(req.getProgramId()));
        t.setCoachProfile(resolveCoachProfile(req.getCoachProfileId()));
        if (req.getRating() != null) t.setRating(req.getRating());
        t.setFeatured(req.isFeatured());
        t.setActive(req.isActive());
        if (req.getDisplayOrder() != null) t.setDisplayOrder(req.getDisplayOrder());
        return toResponse(testimonialRepository.save(t));
    }

    @Transactional
    public void deleteTestimonial(Long id) {
        if (!testimonialRepository.existsById(id)) {
            throw new ResourceNotFoundException("Testimonial", id);
        }
        testimonialRepository.deleteById(id);
    }

    private TestimonialResponse toResponse(Testimonial t) {
        MediaPost mediaPost = t.getMediaPost();
        Program program = t.getProgram();
        CoachProfile coachProfile = t.getCoachProfile();
        return TestimonialResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .roleOrContext(t.getRoleOrContext())
                .storyTitle(t.getStoryTitle())
                .quote(t.getQuote())
                .mediaPostId(mediaPost != null ? mediaPost.getId() : null)
                .mediaUrl(mediaPost != null ? mediaPost.getMediaUrl() : null)
                .mediaType(mediaPost != null ? mediaPost.getMediaType() : null)
                .playerMetadata(t.getPlayerMetadata())
                .teamMetadata(t.getTeamMetadata())
                .programId(program != null ? program.getId() : null)
                .programName(program != null ? program.getName() : null)
                .coachProfileId(coachProfile != null ? coachProfile.getId() : null)
                .coachName(coachProfile != null ? coachProfile.getDisplayName() : null)
                .rating(t.getRating())
                .featured(t.isFeatured())
                .active(t.isActive())
                .displayOrder(t.getDisplayOrder())
                .build();
    }

    private MediaPost resolveMediaPost(Long mediaPostId) {
        if (mediaPostId == null) return null;
        return mediaPostRepository.findById(mediaPostId)
                .orElseThrow(() -> new ResourceNotFoundException("MediaPost", mediaPostId));
    }

    private Program resolveProgram(Long programId) {
        if (programId == null) return null;
        return programRepository.findById(programId)
                .orElseThrow(() -> new ResourceNotFoundException("Program", programId));
    }

    private CoachProfile resolveCoachProfile(Long coachProfileId) {
        if (coachProfileId == null) return null;
        return coachProfileRepository.findById(coachProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("CoachProfile", coachProfileId));
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
