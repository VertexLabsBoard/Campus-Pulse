package com.campuspulse.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "issue_comments")
public class IssueComment extends BaseEntity {

    @Column(name = "issue_id", nullable = false)
    private UUID issueId;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(nullable = false)
    private boolean internal = false;

    public IssueComment() {}

    public IssueComment(UUID issueId, UUID authorId, String body, boolean internal) {
        this.issueId = issueId;
        this.authorId = authorId;
        this.body = body;
        this.internal = internal;
    }

    public static IssueCommentBuilder builder() {
        return new IssueCommentBuilder();
    }

    public static class IssueCommentBuilder {
        private UUID issueId;
        private UUID authorId;
        private String body;
        private boolean internal = false;

        public IssueCommentBuilder issueId(UUID issueId) { this.issueId = issueId; return this; }
        public IssueCommentBuilder authorId(UUID authorId) { this.authorId = authorId; return this; }
        public IssueCommentBuilder body(String body) { this.body = body; return this; }
        public IssueCommentBuilder internal(boolean internal) { this.internal = internal; return this; }

        public IssueComment build() {
            return new IssueComment(issueId, authorId, body, internal);
        }
    }

    public UUID getIssueId() { return issueId; }
    public void setIssueId(UUID issueId) { this.issueId = issueId; }
    public UUID getAuthorId() { return authorId; }
    public void setAuthorId(UUID authorId) { this.authorId = authorId; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public boolean isInternal() { return internal; }
    public void setInternal(boolean internal) { this.internal = internal; }
}
