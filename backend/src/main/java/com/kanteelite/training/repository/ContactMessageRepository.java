package com.kanteelite.training.repository;

import com.kanteelite.training.entity.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
}
