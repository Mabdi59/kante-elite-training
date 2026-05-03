package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.FaqItemRequest;
import com.kanteelite.training.dto.response.FaqItemResponse;
import com.kanteelite.training.entity.FaqItem;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.FaqItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FaqItemService {

    private final FaqItemRepository faqItemRepository;

    @Transactional(readOnly = true)
    public List<FaqItemResponse> getPublicFaqs() {
        return faqItemRepository.findByActiveTrueOrderByDisplayOrderAscCreatedAtAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FaqItemResponse> getFeaturedFaqs() {
        return faqItemRepository.findByActiveTrueAndFeaturedTrueOrderByDisplayOrderAscCreatedAtAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FaqItemResponse> getAdminFaqs() {
        return faqItemRepository.findAllByOrderByDisplayOrderAscCreatedAtAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public FaqItemResponse createFaq(FaqItemRequest request) {
        FaqItem faq = FaqItem.builder().build();
        applyRequest(faq, request);
        return toResponse(faqItemRepository.save(faq));
    }

    @Transactional
    public FaqItemResponse updateFaq(Long id, FaqItemRequest request) {
        FaqItem faq = faqItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FaqItem", id));
        applyRequest(faq, request);
        return toResponse(faqItemRepository.save(faq));
    }

    @Transactional
    public void deleteFaq(Long id) {
        if (!faqItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("FaqItem", id);
        }
        faqItemRepository.deleteById(id);
    }

    private void applyRequest(FaqItem faq, FaqItemRequest request) {
        faq.setQuestion(request.getQuestion().trim());
        faq.setAnswer(request.getAnswer().trim());
        faq.setCategory(StringUtils.hasText(request.getCategory()) ? request.getCategory().trim() : null);
        faq.setActive(request.isActive());
        faq.setFeatured(request.isFeatured());
        faq.setDisplayOrder(request.getDisplayOrder() == null ? 0 : request.getDisplayOrder());
    }

    private FaqItemResponse toResponse(FaqItem faq) {
        return FaqItemResponse.builder()
                .id(faq.getId())
                .question(faq.getQuestion())
                .answer(faq.getAnswer())
                .category(faq.getCategory())
                .active(faq.isActive())
                .featured(faq.isFeatured())
                .displayOrder(faq.getDisplayOrder())
                .createdAt(faq.getCreatedAt())
                .updatedAt(faq.getUpdatedAt())
                .build();
    }
}
