package com.kanteelite.training.repository;

import com.kanteelite.training.entity.PlayerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerProfileRepository extends JpaRepository<PlayerProfile, Long> {
    List<PlayerProfile> findByParentUserIdAndActiveTrueOrderByNameAsc(Long parentUserId);

    @Query("SELECT p FROM PlayerProfile p WHERE p.parentUser.email = :email AND p.active = true ORDER BY p.name ASC")
    List<PlayerProfile> findByParentUserEmailAndActiveTrueOrderByNameAsc(@Param("email") String email);

    List<PlayerProfile> findAllByOrderByCreatedAtDesc();
    boolean existsByParentUserIdAndActiveTrue(Long parentUserId);
    long countByActiveTrue();
    void deleteByParentUserId(Long parentUserId);
    long countByParentUserId(Long parentUserId);
    List<PlayerProfile> findByParentUserIdOrderByNameAsc(Long parentUserId);
}
