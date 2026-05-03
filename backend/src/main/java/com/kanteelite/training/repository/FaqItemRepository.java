package com.kanteelite.training.repository;

import com.kanteelite.training.entity.FaqItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaqItemRepository extends JpaRepository<FaqItem, Long> {
    List<FaqItem> findByActiveTrueOrderByDisplayOrderAscCreatedAtAsc();
    List<FaqItem> findByActiveTrueAndFeaturedTrueOrderByDisplayOrderAscCreatedAtAsc();
    List<FaqItem> findAllByOrderByDisplayOrderAscCreatedAtAsc();
}
