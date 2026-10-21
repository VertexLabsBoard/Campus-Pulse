package com.campuspulse.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "issue_status_history")
public class IssueStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "issue_id", nullable = false)
    private UUID issueId;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 20)
    private Issue.Status fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 20)
    private Issue.Status toStatus;

    @Column(name = "changed_by", nullable = false)
    private UUID changedBy;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @CreationTimestamp
    @Column(name = "changed_at", nullable = false, updatable = false)
    private Instant changedAt;

    public IssueStatusHistory() {}

    public IssueStatusHistory(UUID id, UUID issueId, Issue.Status fromStatus, Issue.Status toStatus, UUID changedBy, String reason, Instant changedAt) {
        this.id = id;
        this.issueId = issueId;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.changedBy = changedBy;
        this.reason = reason;
        this.changedAt = changedAt;
    }

    public static IssueStatusHistoryBuilder builder() {
        return new IssueStatusHistoryBuilder();
    }

    public static class IssueStatusHistoryBuilder {
        private UUID id;
        private UUID issueId;
        private Issue.Status fromStatus;
        private Issue.Status toStatus;
        private UUID changedBy;
        private String reason;
        private Instant changedAt;

        public IssueStatusHistoryBuilder id(UUID id) { this.id = id; return this; }
        public IssueStatusHistoryBuilder issueId(UUID issueId) { this.issueId = issueId; return this; }
        public IssueStatusHistoryBuilder fromStatus(Issue.Status fromStatus) { this.fromStatus = fromStatus; return this; }
        public IssueStatusHistoryBuilder toStatus(Issue.Status toStatus) { this.toStatus = toStatus; return this; }
        public IssueStatusHistoryBuilder changedBy(UUID changedBy) { this.changedBy = changedBy; return this; }
        public IssueStatusHistoryBuilder reason(String reason) { this.reason = reason; return this; }
        public IssueStatusHistoryBuilder changedAt(Instant changedAt) { this.changedAt = changedAt; return this; }

        public IssueStatusHistory build() {
            return new IssueStatusHistory(id, issueId, fromStatus, toStatus, changedBy, reason, changedAt);
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getIssueId() { return issueId; }
    public void setIssueId(UUID issueId) { this.issueId = issueId; }
    public Issue.Status getFromStatus() { return fromStatus; }
    public void setFromStatus(Issue.Status fromStatus) { this.fromStatus = fromStatus; }
    public Issue.Status getToStatus() { return toStatus; }
    public void setToStatus(Issue.Status toStatus) { this.toStatus = toStatus; }
    public UUID getChangedBy() { return changedBy; }
    public void setChangedBy(UUID changedBy) { this.changedBy = changedBy; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public Instant getChangedAt() { return changedAt; }
    public void setChangedAt(Instant changedAt) { this.changedAt = changedAt; }
}
