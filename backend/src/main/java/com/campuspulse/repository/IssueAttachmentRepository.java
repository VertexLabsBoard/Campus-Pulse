package com.campuspulse.repository;

import com.campuspulse.domain.IssueAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IssueAttachmentRepository extends JpaRepository<IssueAttachment, UUID> {
    List<IssueAttachment> findByIssueId(UUID issueId);
    List<IssueAttachment> findByIssueIdAndKind(UUID issueId, IssueAttachment.Kind kind);
}
