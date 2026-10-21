package com.campuspulse.repository;

import com.campuspulse.domain.Issue;
import com.campuspulse.domain.SlaPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SlaPolicyRepository extends JpaRepository<SlaPolicy, UUID> {
    Optional<SlaPolicy> findByCategoryAndPriorityLevel(String category, Issue.PriorityLevel priorityLevel);
}
