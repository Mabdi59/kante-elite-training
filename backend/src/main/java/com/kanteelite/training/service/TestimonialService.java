package com.kanteelite.training.service;

import com.kanteelite.training.dto.response.TestimonialResponse;
import com.kanteelite.training.entity.Testimonial;
import com.kanteelite.training.repository.TestimonialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
