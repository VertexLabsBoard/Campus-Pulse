package com.campuspulse.repository;

import com.campuspulse.domain.IssueSupporter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IssueSupporterRepository extends JpaRepository<IssueSupporter, IssueSupporter.IssueSupporterId> {
    long countByIssueId(UUID issueId);
    boolean existsByIssueIdAndUserId(UUID issueId, UUID userId);
    void deleteByIssueIdAndUserId(UUID issueId, UUID userId);
    List<IssueSupporter> findByIssueId(UUID issueId);
}
