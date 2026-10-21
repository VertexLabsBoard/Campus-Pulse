package com.campuspulse.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "issue_attachments")
public class IssueAttachment extends BaseEntity {

    public enum Kind { REPORT, BEFORE, AFTER }

    @Column(name = "issue_id", nullable = false)
    private UUID issueId;

    @Column(name = "uploader_id", nullable = false)
    private UUID uploaderId;

    @Column(name = "storage_key", nullable = false, unique = true, length = 500)
    private String storageKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Kind kind;

    @Column(nullable = false, length = 100)
    private String mime;

    @Column(nullable = false)
    private Long size;

    public IssueAttachment() {}

    public IssueAttachment(UUID issueId, UUID uploaderId, String storageKey, Kind kind, String mime, Long size) {
        this.issueId = issueId;
        this.uploaderId = uploaderId;
        this.storageKey = storageKey;
        this.kind = kind;
        this.mime = mime;
        this.size = size;
    }

    public static IssueAttachmentBuilder builder() {
        return new IssueAttachmentBuilder();
    }

    public static class IssueAttachmentBuilder {
        private UUID issueId;
        private UUID uploaderId;
        private String storageKey;
        private Kind kind;
        private String mime;
        private Long size;

        public IssueAttachmentBuilder issueId(UUID issueId) { this.issueId = issueId; return this; }
        public IssueAttachmentBuilder uploaderId(UUID uploaderId) { this.uploaderId = uploaderId; return this; }
        public IssueAttachmentBuilder storageKey(String storageKey) { this.storageKey = storageKey; return this; }
        public IssueAttachmentBuilder kind(Kind kind) { this.kind = kind; return this; }
        public IssueAttachmentBuilder mime(String mime) { this.mime = mime; return this; }
        public IssueAttachmentBuilder size(Long size) { this.size = size; return this; }

        public IssueAttachment build() {
            return new IssueAttachment(issueId, uploaderId, storageKey, kind, mime, size);
        }
    }

    public UUID getIssueId() { return issueId; }
    public void setIssueId(UUID issueId) { this.issueId = issueId; }
    public UUID getUploaderId() { return uploaderId; }
    public void setUploaderId(UUID uploaderId) { this.uploaderId = uploaderId; }
    public String getStorageKey() { return storageKey; }
    public void setStorageKey(String storageKey) { this.storageKey = storageKey; }
    public Kind getKind() { return kind; }
    public void setKind(Kind kind) { this.kind = kind; }
    public String getMime() { return mime; }
    public void setMime(String mime) { this.mime = mime; }
    public Long getSize() { return size; }
    public void setSize(Long size) { this.size = size; }
}
