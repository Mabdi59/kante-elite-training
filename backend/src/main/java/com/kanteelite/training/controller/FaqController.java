package com.kanteelite.training.controller;

import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.FaqItemResponse;
import com.kanteelite.training.service.FaqItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faqs")
@RequiredArgsConstructor
public class FaqController {

    private final FaqItemService faqItemService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FaqItemResponse>>> getPublicFaqs(
            @RequestParam(required = false, defaultValue = "false") boolean featured) {
        List<FaqItemResponse> faqs = featured ? faqItemService.getFeaturedFaqs() : faqItemService.getPublicFaqs();
        return ResponseEntity.ok(ApiResponse.success(faqs));
    }
}
