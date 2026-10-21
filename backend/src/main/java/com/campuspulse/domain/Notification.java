package com.campuspulse.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications")
public class Notification extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "issue_id")
    private UUID issueId;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "read_at")
    private Instant readAt;

    public Notification() {}

    public Notification(UUID userId, UUID issueId, String type, String message, Instant readAt) {
        this.userId = userId;
        this.issueId = issueId;
        this.type = type;
        this.message = message;
        this.readAt = readAt;
    }

    public static NotificationBuilder builder() {
        return new NotificationBuilder();
    }

    public static class NotificationBuilder {
        private UUID userId;
        private UUID issueId;
        private String type;
        private String message;
        private Instant readAt;

        public NotificationBuilder userId(UUID userId) { this.userId = userId; return this; }
        public NotificationBuilder issueId(UUID issueId) { this.issueId = issueId; return this; }
        public NotificationBuilder type(String type) { this.type = type; return this; }
        public NotificationBuilder message(String message) { this.message = message; return this; }
        public NotificationBuilder readAt(Instant readAt) { this.readAt = readAt; return this; }

        public Notification build() {
            return new Notification(userId, issueId, type, message, readAt);
        }
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public UUID getIssueId() { return issueId; }
    public void setIssueId(UUID issueId) { this.issueId = issueId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Instant getReadAt() { return readAt; }
    public void setReadAt(Instant readAt) { this.readAt = readAt; }
}
