package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.TestimonialRequest;
import com.kanteelite.training.dto.response.TestimonialResponse;
import com.kanteelite.training.entity.Testimonial;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.TestimonialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TestimonialService {

    private final TestimonialRepository testimonialRepository;

    public List<TestimonialResponse> getAllTestimonials() {
        return testimonialRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<TestimonialResponse> getFeaturedTestimonials() {
        return testimonialRepository.findByFeaturedTrueOrderByDisplayOrderAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TestimonialResponse createTestimonial(TestimonialRequest req) {
        Testimonial t = Testimonial.builder()
                .name(req.getName())
                .roleOrContext(req.getRoleOrContext())
                .quote(req.getQuote())
                .rating(req.getRating() != null ? req.getRating() : 5)
                .featured(req.isFeatured())
                .displayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0)
                .build();
        return toResponse(testimonialRepository.save(t));
    }

    @Transactional
    public TestimonialResponse updateTestimonial(Long id, TestimonialRequest req) {
        Testimonial t = testimonialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Testimonial", id));
        t.setName(req.getName());
        t.setRoleOrContext(req.getRoleOrContext());
        t.setQuote(req.getQuote());
        if (req.getRating() != null) t.setRating(req.getRating());
        t.setFeatured(req.isFeatured());
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
        return TestimonialResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .roleOrContext(t.getRoleOrContext())
                .quote(t.getQuote())
                .rating(t.getRating())
                .featured(t.isFeatured())
                .displayOrder(t.getDisplayOrder())
                .build();
    }
}
