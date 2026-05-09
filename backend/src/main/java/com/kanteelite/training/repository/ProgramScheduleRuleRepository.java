package com.kanteelite.training.repository;

import com.kanteelite.training.entity.ProgramScheduleRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgramScheduleRuleRepository extends JpaRepository<ProgramScheduleRule, Long> {
    List<ProgramScheduleRule> findByProgramIdOrderByDayOfWeekAscStartTimeAsc(Long programId);
    void deleteByProgramId(Long programId);
}
