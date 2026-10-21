package com.campuspulse.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "feedback", uniqueConstraints = @UniqueConstraint(columnNames = {"issue_id", "user_id"}))
public class Feedback extends BaseEntity {

    @Column(name = "issue_id", nullable = false)
    private UUID issueId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "fixed_confirmed", nullable = false)
    private Boolean fixedConfirmed;

    @Column
    private Short rating;  // 1–5

    @Column(columnDefinition = "TEXT")
    private String comment;

    public Feedback() {}

    public Feedback(UUID issueId, UUID userId, Boolean fixedConfirmed, Short rating, String comment) {
        this.issueId = issueId;
        this.userId = userId;
        this.fixedConfirmed = fixedConfirmed;
        this.rating = rating;
        this.comment = comment;
    }

    public static FeedbackBuilder builder() {
        return new FeedbackBuilder();
    }

    public static class FeedbackBuilder {
        private UUID issueId;
        private UUID userId;
        private Boolean fixedConfirmed;
        private Short rating;
        private String comment;

        public FeedbackBuilder issueId(UUID issueId) { this.issueId = issueId; return this; }
        public FeedbackBuilder userId(UUID userId) { this.userId = userId; return this; }
        public FeedbackBuilder fixedConfirmed(Boolean fixedConfirmed) { this.fixedConfirmed = fixedConfirmed; return this; }
        public FeedbackBuilder rating(Short rating) { this.rating = rating; return this; }
        public FeedbackBuilder comment(String comment) { this.comment = comment; return this; }

        public Feedback build() {
            return new Feedback(issueId, userId, fixedConfirmed, rating, comment);
        }
    }

    public UUID getIssueId() { return issueId; }
    public void setIssueId(UUID issueId) { this.issueId = issueId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public Boolean getFixedConfirmed() { return fixedConfirmed; }
    public void setFixedConfirmed(Boolean fixedConfirmed) { this.fixedConfirmed = fixedConfirmed; }
    public Short getRating() { return rating; }
    public void setRating(Short rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
