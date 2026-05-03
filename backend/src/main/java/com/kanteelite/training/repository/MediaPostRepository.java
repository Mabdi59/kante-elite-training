package com.kanteelite.training.repository;

import com.kanteelite.training.entity.MediaPlacement;
import com.kanteelite.training.entity.MediaPost;
import com.kanteelite.training.enums.MediaCategory;
import com.kanteelite.training.enums.MediaPlacementKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaPostRepository extends JpaRepository<MediaPost, Long> {

    @Query("""
        select m from MediaPost m
        join MediaPlacement p on p.mediaPost = m
        where p.placementKey = :placementKey
        order by
            case when p.displayOrder > 0 then 0 else 1 end asc,
            p.displayOrder asc,
            m.createdAt desc
        """)
    List<MediaPost> findByPlacementForDisplay(@Param("placementKey") MediaPlacementKey placementKey);

    @Query("""
        select m from MediaPost m
        join MediaPlacement p on p.mediaPost = m
        where p.placementKey = :placementKey
          and (:category is null or m.mediaCategory = :category)
        order by
            case when p.displayOrder > 0 then 0 else 1 end asc,
            p.displayOrder asc,
            m.createdAt desc
        """)
    List<MediaPost> findByPlacementAndCategoryForDisplay(
            @Param("placementKey") MediaPlacementKey placementKey,
            @Param("category") MediaCategory category
    );
}
