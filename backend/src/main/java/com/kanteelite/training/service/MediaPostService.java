package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.MediaPostUpdateRequest;
import com.kanteelite.training.dto.request.MediaPlacementRequest;
import com.kanteelite.training.dto.response.MediaPlacementResponse;
import com.kanteelite.training.dto.response.MediaPostResponse;
import com.kanteelite.training.entity.MediaPlacement;
import com.kanteelite.training.entity.MediaPost;
import com.kanteelite.training.enums.MediaCategory;
import com.kanteelite.training.enums.MediaPlacementKey;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.MediaPlacementRepository;
import com.kanteelite.training.repository.MediaPostRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MediaPostService {

    private static final Logger log = LoggerFactory.getLogger(MediaPostService.class);

    private final MediaPostRepository mediaPostRepository;
    private final MediaPlacementRepository mediaPlacementRepository;
    private final MediaStorageService mediaStorageService;

    @Transactional(readOnly = true)
    public List<MediaPostResponse> getPublicFeed(MediaCategory category, MediaPlacementKey placement) {
        MediaPlacementKey resolvedPlacement = placement == null ? MediaPlacementKey.MEDIA_LIBRARY : placement;
        List<MediaPost> posts = mediaPostRepository.findByPlacementAndCategoryForDisplay(resolvedPlacement, category);
        return posts.stream().map(this::toResponse).toList();
    }

    @Transactional
    public MediaPostResponse createPost(
            MultipartFile file,
            String caption,
            String altText,
            MediaCategory category
    ) {
        if (StringUtils.hasText(caption) && caption.trim().length() > 500) {
            throw new IllegalArgumentException("Caption must be 500 characters or less.");
        }
        if (StringUtils.hasText(altText) && altText.trim().length() > 255) {
            throw new IllegalArgumentException("Alt text must be 255 characters or less.");
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
                    .altText(StringUtils.hasText(altText) ? altText.trim() : null)
                    .mediaCategory(category)
                    .build());
            mediaPlacementRepository.save(MediaPlacement.builder()
                    .mediaPost(saved)
                    .placementKey(MediaPlacementKey.MEDIA_LIBRARY)
                    .displayOrder(0)
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
        if (request.getAltText() != null) {
            mediaPost.setAltText(StringUtils.hasText(request.getAltText()) ? request.getAltText().trim() : null);
        }
        if (request.isClearMediaCategory()) {
            mediaPost.setMediaCategory(null);
        } else if (request.getMediaCategory() != null) {
            mediaPost.setMediaCategory(request.getMediaCategory());
        }
        if (request.getPlacements() != null) {
            replacePlacements(mediaPost, request.getPlacements());
        }

        return toResponse(mediaPostRepository.save(mediaPost));
    }

    @Transactional
    public MediaPostResponse replacePostMedia(Long id, MultipartFile file) {
        MediaPost mediaPost = mediaPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MediaPost", id));

        String previousUrl = mediaPost.getMediaUrl();
        MediaStorageService.StoredMedia storedMedia;
        try {
            storedMedia = mediaStorageService.storePostMedia(file);
        } catch (IOException ex) {
            log.error("Failed to store replacement media upload for post {}.", id, ex);
            throw new IllegalStateException("Could not store the replacement media file.");
        }

        try {
            mediaPost.setMediaUrl(storedMedia.getPublicUrl());
            mediaPost.setMediaType(storedMedia.getMediaType());
            MediaPost saved = mediaPostRepository.save(mediaPost);

            try {
                mediaStorageService.deleteStoredMedia(previousUrl);
            } catch (RuntimeException | IOException cleanupEx) {
                log.warn("Failed to clean up replaced media file for post {} at {}", id, previousUrl, cleanupEx);
            }

            return toResponse(saved);
        } catch (RuntimeException ex) {
            try {
                mediaStorageService.deleteStoredMedia(storedMedia.getPublicUrl());
            } catch (RuntimeException | IOException cleanupEx) {
                log.warn("Failed to clean up replacement media file after update failure: {}", storedMedia.getPublicUrl(), cleanupEx);
            }
            throw ex;
        }
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

    private void replacePlacements(MediaPost mediaPost, List<MediaPlacementRequest> placementRequests) {
        mediaPlacementRepository.deleteByMediaPost(mediaPost);
        mediaPlacementRepository.flush();
        List<MediaPlacement> placements = placementRequests.stream()
                .filter(request -> request.getKey() != null)
                .collect(java.util.stream.Collectors.toMap(
                        MediaPlacementRequest::getKey,
                        request -> request,
                        (left, right) -> right
                ))
                .values()
                .stream()
                .map(request -> MediaPlacement.builder()
                        .mediaPost(mediaPost)
                        .placementKey(request.getKey())
                        .displayOrder(request.getDisplayOrder() == null ? 0 : request.getDisplayOrder())
                        .build())
                .toList();
        mediaPlacementRepository.saveAll(placements);
    }

    private MediaPostResponse toResponse(MediaPost mediaPost) {
        List<MediaPlacementResponse> placements = mediaPlacementRepository.findByMediaPost(mediaPost)
                .stream()
                .sorted(Comparator
                        .comparing(MediaPlacement::getPlacementKey)
                        .thenComparingInt(MediaPlacement::getDisplayOrder))
                .map(placement -> MediaPlacementResponse.builder()
                        .key(placement.getPlacementKey())
                        .displayOrder(placement.getDisplayOrder())
                        .build())
                .toList();

        return MediaPostResponse.builder()
                .id(mediaPost.getId())
                .mediaUrl(mediaPost.getMediaUrl())
                .mediaType(mediaPost.getMediaType())
                .caption(mediaPost.getCaption())
                .altText(mediaPost.getAltText())
                .mediaCategory(mediaPost.getMediaCategory())
                .placements(placements)
                .createdAt(mediaPost.getCreatedAt())
                .build();
    }
}
