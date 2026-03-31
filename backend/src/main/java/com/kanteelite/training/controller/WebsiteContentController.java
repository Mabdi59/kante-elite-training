package com.kanteelite.training.controller;

import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.WebsiteContentResponse;
import com.kanteelite.training.service.WebsiteContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
public class WebsiteContentController {

    private final WebsiteContentService websiteContentService;

    @GetMapping
    public ResponseEntity<ApiResponse<WebsiteContentResponse>> getPublicContent() {
        return ResponseEntity.ok(ApiResponse.success(websiteContentService.getPublicContent()));
    }
}
