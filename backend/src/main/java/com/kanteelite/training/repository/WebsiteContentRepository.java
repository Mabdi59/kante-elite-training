package com.kanteelite.training.repository;

import com.kanteelite.training.entity.WebsiteContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WebsiteContentRepository extends JpaRepository<WebsiteContent, Long> {
    Optional<WebsiteContent> findTopByOrderByIdAsc();
}
