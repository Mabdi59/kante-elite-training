package com.kanteelite.training.repository;

import com.kanteelite.training.entity.Testimonial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestimonialRepository extends JpaRepository<Testimonial, Long> {
    List<Testimonial> findByActiveTrueOrderByDisplayOrderAscCreatedAtAsc();
    List<Testimonial> findByActiveTrueAndFeaturedTrueOrderByDisplayOrderAscCreatedAtAsc();
    List<Testimonial> findAllByOrderByDisplayOrderAscCreatedAtAsc();
}
