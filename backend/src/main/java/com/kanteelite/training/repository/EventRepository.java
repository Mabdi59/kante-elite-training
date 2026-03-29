package com.kanteelite.training.repository;

import com.kanteelite.training.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStartDateGreaterThanEqualOrderByStartDateAsc(LocalDate date);
    List<Event> findByStatusAndStartDateGreaterThanEqualOrderByDisplayOrderAscStartDateAsc(String status, LocalDate date);
}
