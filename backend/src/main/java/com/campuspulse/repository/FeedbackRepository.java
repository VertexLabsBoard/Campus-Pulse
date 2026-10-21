package com.campuspulse.repository;

import com.campuspulse.domain.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {
    Optional<Feedback> findByIssueIdAndUserId(UUID issueId, UUID userId);
    Optional<Feedback> findByIssueId(UUID issueId);
}
