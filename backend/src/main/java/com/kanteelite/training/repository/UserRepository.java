package com.kanteelite.training.repository;

import com.kanteelite.training.entity.User;
import com.kanteelite.training.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email, Long id);
    long countByRole(UserRole role);
    Optional<User> findByIcalFeedToken(String icalFeedToken);

    List<User> findByRoleOrderByNameAsc(UserRole role);

    @Query("SELECT u FROM User u WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(u.name) LIKE LOWER(CONCAT('%', :q, '%')) ORDER BY u.name ASC")
    List<User> searchByQuery(@Param("q") String q, org.springframework.data.domain.Pageable pageable);
}
