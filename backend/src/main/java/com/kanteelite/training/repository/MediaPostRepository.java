package com.kanteelite.training.repository;

import com.kanteelite.training.entity.MediaPost;
import com.kanteelite.training.enums.MediaCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaPostRepository extends JpaRepository<MediaPost, Long> {

    @Query("""
        select m from MediaPost m
        order by
            m.isFeatured desc,
            case when m.displayOrder > 0 then 0 else 1 end asc,
            m.displayOrder asc,
            m.createdAt desc
        """)
    List<MediaPost> findAllForDisplay();

    @Query("""
        select m from MediaPost m
        where m.mediaCategory = :category
        order by
            m.isFeatured desc,
            case when m.displayOrder > 0 then 0 else 1 end asc,
            m.displayOrder asc,
            m.createdAt desc
        """)
    List<MediaPost> findByCategoryForDisplay(@Param("category") MediaCategory category);

    @Modifying
    @Query("update MediaPost m set m.isFeatured = false where m.id <> :id and m.isFeatured = true")
    void clearFeaturedForOtherPosts(@Param("id") Long id);
}
