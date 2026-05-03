package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.request.FaqItemRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.FaqItemResponse;
import com.kanteelite.training.service.FaqItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/faqs")
@RequiredArgsConstructor
public class AdminFaqController {

    private final FaqItemService faqItemService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FaqItemResponse>>> getAdminFaqs() {
        return ResponseEntity.ok(ApiResponse.success(faqItemService.getAdminFaqs()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FaqItemResponse>> createFaq(@Valid @RequestBody FaqItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("FAQ created.", faqItemService.createFaq(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FaqItemResponse>> updateFaq(
            @PathVariable Long id,
            @Valid @RequestBody FaqItemRequest request) {
        return ResponseEntity.ok(ApiResponse.success("FAQ updated.", faqItemService.updateFaq(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFaq(@PathVariable Long id) {
        faqItemService.deleteFaq(id);
        return ResponseEntity.ok(ApiResponse.success("FAQ deleted.", null));
    }
}
