package com.kanteelite.training.repository;

import com.kanteelite.training.entity.AvailabilityRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvailabilityRuleRepository extends JpaRepository<AvailabilityRule, Long> {
    List<AvailabilityRule> findByActiveTrueOrderByDayOfWeekAscStartTimeAsc();
    List<AvailabilityRule> findByActiveTrueAndDayOfWeek(int dayOfWeek);
}
