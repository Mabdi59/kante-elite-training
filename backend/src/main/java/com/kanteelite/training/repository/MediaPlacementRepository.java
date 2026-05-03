package com.kanteelite.training.repository;

import com.kanteelite.training.entity.MediaPlacement;
import com.kanteelite.training.entity.MediaPost;
import com.kanteelite.training.enums.MediaPlacementKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaPlacementRepository extends JpaRepository<MediaPlacement, Long> {
    List<MediaPlacement> findByMediaPost(MediaPost mediaPost);
    void deleteByMediaPost(MediaPost mediaPost);
    boolean existsByMediaPostAndPlacementKey(MediaPost mediaPost, MediaPlacementKey placementKey);
}
