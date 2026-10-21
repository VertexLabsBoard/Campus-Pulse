package com.campuspulse.repository;

import com.campuspulse.domain.IssueComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IssueCommentRepository extends JpaRepository<IssueComment, UUID> {
    List<IssueComment> findByIssueIdOrderByCreatedAtAsc(UUID issueId);
    List<IssueComment> findByIssueIdAndInternalFalseOrderByCreatedAtAsc(UUID issueId);
}
