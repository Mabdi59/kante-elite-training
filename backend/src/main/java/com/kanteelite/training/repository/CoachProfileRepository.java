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

    List<CoachProfile> findByActiveTrueOrderByCreatedAtDesc();
    List<CoachProfile> findAllByOrderByCreatedAtDesc();
    long countByActiveTrue();

    @Query("SELECT c FROM CoachProfile c JOIN c.user u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(COALESCE(c.bio, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(COALESCE(c.specialties, '')) LIKE LOWER(CONCAT('%', :q, '%')) ORDER BY u.name ASC")
    List<CoachProfile> searchByQuery(@Param("q") String q, org.springframework.data.domain.Pageable pageable);
}
