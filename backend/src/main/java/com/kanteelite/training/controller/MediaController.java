package com.kanteelite.training.controller;

import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.MediaPostResponse;
import com.kanteelite.training.service.MediaPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaPostService mediaPostService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MediaPostResponse>>> getPublicFeed() {
        return ResponseEntity.ok(ApiResponse.success(mediaPostService.getPublicFeed()));
    }
}
