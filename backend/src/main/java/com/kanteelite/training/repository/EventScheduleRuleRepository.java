package com.kanteelite.training.repository;

import com.kanteelite.training.entity.EventScheduleRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventScheduleRuleRepository extends JpaRepository<EventScheduleRule, Long> {
    List<EventScheduleRule> findByEventIdOrderByDayOfWeekAscStartTimeAsc(Long eventId);
    void deleteByEventId(Long eventId);
}
