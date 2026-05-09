package com.kanteelite.training.repository;

import com.kanteelite.training.entity.User;
import com.kanteelite.training.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email, Long id);
    long countByRole(UserRole role);
    Optional<User> findByIcalFeedToken(String icalFeedToken);
    Optional<User> findFirstByRoleOrderByNameAsc(UserRole role);

    List<User> findByRoleOrderByNameAsc(UserRole role);
}
