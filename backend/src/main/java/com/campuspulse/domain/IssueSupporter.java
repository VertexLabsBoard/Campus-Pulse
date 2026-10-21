package com.campuspulse.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "issue_supporters")
@IdClass(IssueSupporter.IssueSupporterId.class)
public class IssueSupporter {

    public static class IssueSupporterId implements Serializable {
        private UUID issueId;
        private UUID userId;

        public IssueSupporterId() {}
        public IssueSupporterId(UUID issueId, UUID userId) {
            this.issueId = issueId;
            this.userId = userId;
        }

        public UUID getIssueId() { return issueId; }
        public void setIssueId(UUID issueId) { this.issueId = issueId; }
        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            IssueSupporterId that = (IssueSupporterId) o;
            return Objects.equals(issueId, that.issueId) && Objects.equals(userId, that.userId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(issueId, userId);
        }
    }

    @Id
    @Column(name = "issue_id", nullable = false)
    private UUID issueId;

    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public IssueSupporter() {}

    public IssueSupporter(UUID issueId, UUID userId, Instant createdAt) {
        this.issueId = issueId;
        this.userId = userId;
        this.createdAt = createdAt;
    }

    public static IssueSupporterBuilder builder() {
        return new IssueSupporterBuilder();
    }

    public static class IssueSupporterBuilder {
        private UUID issueId;
        private UUID userId;
        private Instant createdAt;

        public IssueSupporterBuilder issueId(UUID issueId) { this.issueId = issueId; return this; }
        public IssueSupporterBuilder userId(UUID userId) { this.userId = userId; return this; }
        public IssueSupporterBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public IssueSupporter build() {
            return new IssueSupporter(issueId, userId, createdAt);
        }
    }

    public UUID getIssueId() { return issueId; }
    public void setIssueId(UUID issueId) { this.issueId = issueId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
