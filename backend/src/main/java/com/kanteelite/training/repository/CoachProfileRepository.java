package com.kanteelite.training.repository;

import com.kanteelite.training.entity.CoachProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CoachProfileRepository extends JpaRepository<CoachProfile, Long> {
    Optional<CoachProfile> findByUserId(Long userId);

    @Query("SELECT c FROM CoachProfile c WHERE c.user.email = :email")
    Optional<CoachProfile> findByUserEmail(@Param("email") String email);

    List<CoachProfile> findByActiveTrueOrderByDisplayOrderAscCreatedAtAsc();
    List<CoachProfile> findByActiveTrueAndFeaturedTrueOrderByDisplayOrderAscCreatedAtAsc();
    List<CoachProfile> findAllByOrderByDisplayOrderAscCreatedAtAsc();
    long countByActiveTrue();
}
