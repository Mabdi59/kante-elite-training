package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.MediaPostUpdateRequest;
import com.kanteelite.training.dto.response.MediaPostResponse;
import com.kanteelite.training.entity.MediaPost;
import com.kanteelite.training.enums.MediaCategory;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.MediaPostRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MediaPostService {

    private static final Logger log = LoggerFactory.getLogger(MediaPostService.class);

    private final MediaPostRepository mediaPostRepository;
    private final MediaStorageService mediaStorageService;

    @Transactional(readOnly = true)
    public List<MediaPostResponse> getPublicFeed(MediaCategory category) {
        List<MediaPost> posts = (category != null)
                ? mediaPostRepository.findByCategoryForDisplay(category)
                : mediaPostRepository.findAllForDisplay();
        return posts.stream().map(this::toResponse).toList();
    }

    @Transactional
    public MediaPostResponse createPost(MultipartFile file, String caption, MediaCategory category) {
        if (StringUtils.hasText(caption) && caption.trim().length() > 500) {
            throw new IllegalArgumentException("Caption must be 500 characters or less.");
        }

        MediaStorageService.StoredMedia storedMedia;
        try {
            storedMedia = mediaStorageService.storePostMedia(file);
        } catch (IOException ex) {
            log.error("Failed to store media upload.", ex);
            throw new IllegalStateException("Could not store the uploaded media file.");
        }

        try {
            MediaPost saved = mediaPostRepository.save(MediaPost.builder()
                    .mediaUrl(storedMedia.getPublicUrl())
                    .mediaType(storedMedia.getMediaType())
                    .caption(StringUtils.hasText(caption) ? caption.trim() : null)
                    .mediaCategory(category)
                    .build());
            return toResponse(saved);
        } catch (RuntimeException ex) {
            try {
                mediaStorageService.deleteStoredMedia(storedMedia.getPublicUrl());
            } catch (IOException cleanupEx) {
                log.warn("Failed to clean up media file after create failure: {}", storedMedia.getPublicUrl(), cleanupEx);
            }
            throw ex;
        }
    }

    @Transactional
    public MediaPostResponse updatePost(Long id, MediaPostUpdateRequest request) {
        MediaPost mediaPost = mediaPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MediaPost", id));

        if (request.getCaption() != null) {
            mediaPost.setCaption(StringUtils.hasText(request.getCaption()) ? request.getCaption().trim() : null);
        }
        if (Boolean.TRUE.equals(request.getFeatured())) {
            mediaPostRepository.clearFeaturedForOtherPosts(id);
            mediaPost.setFeatured(true);
        } else if (request.getFeatured() != null) {
            mediaPost.setFeatured(false);
        }
        if (request.getShowOnHome() != null) {
            mediaPost.setShowOnHome(request.getShowOnHome());
        }
        if (request.getShowOnAbout() != null) {
            mediaPost.setShowOnAbout(request.getShowOnAbout());
        }
        if (request.getMediaCategory() != null) {
            mediaPost.setMediaCategory(request.getMediaCategory());
        }

        return toResponse(mediaPostRepository.save(mediaPost));
    }

    @Transactional
    public void deletePost(Long id) {
        MediaPost mediaPost = mediaPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MediaPost", id));
        mediaPostRepository.delete(mediaPost);

        try {
            mediaStorageService.deleteStoredMedia(mediaPost.getMediaUrl());
        } catch (IOException ex) {
            log.warn("Failed to delete media file for post {} at {}", id, mediaPost.getMediaUrl(), ex);
        }
    }

    private MediaPostResponse toResponse(MediaPost mediaPost) {
        return MediaPostResponse.builder()
                .id(mediaPost.getId())
                .mediaUrl(mediaPost.getMediaUrl())
                .mediaType(mediaPost.getMediaType())
                .caption(mediaPost.getCaption())
                .featured(mediaPost.isFeatured())
                .showOnHome(mediaPost.isShowOnHome())
                .showOnAbout(mediaPost.isShowOnAbout())
                .mediaCategory(mediaPost.getMediaCategory())
                .createdAt(mediaPost.getCreatedAt())
                .build();
    }
}
