package com.campuspulse.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "issues")
@org.hibernate.annotations.OptimisticLocking(type = org.hibernate.annotations.OptimisticLockType.VERSION)
public class Issue extends BaseEntity {

    public enum Status {
        SUBMITTED, VERIFIED, ASSIGNED, IN_PROGRESS,
        RESOLVED, CLOSED, REJECTED, DUPLICATE, REOPENED
    }

    public enum PriorityLevel { CRITICAL, HIGH, MEDIUM, LOW }

    @Column(name = "ticket_no", nullable = false, unique = true, length = 20, updatable = false)
    private String ticketNo;

    @PrePersist
    public void prePersist() {
        if (ticketNo == null || ticketNo.isBlank()) {
            ticketNo = "CP-" + (1000 + (int)(Math.random() * 9000));
        }
    }

    @Column(name = "reporter_id", nullable = false)
    private UUID reporterId;

    @Column(name = "location_id", nullable = false)
    private UUID locationId;

    @Column(name = "asset_id")
    private UUID assetId;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Short severity;  // 1–5

    @Column(name = "safety_flag", nullable = false)
    private boolean safetyFlag = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.SUBMITTED;

    @Column(name = "priority_score", precision = 5, scale = 2)
    private BigDecimal priorityScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority_level", length = 10)
    private PriorityLevel priorityLevel;

    /** JSON blob: { score, level, reasons: [{factor, points, explanation}] } */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "priority_explanation")
    private Map<String, Object> priorityExplanation;

    @Column(name = "priority_override_reason", columnDefinition = "TEXT")
    private String priorityOverrideReason;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "assignee_id")
    private UUID assigneeId;

    @Column(name = "duplicate_of_issue_id")
    private UUID duplicateOfIssueId;

    @Column(name = "sla_due_at")
    private Instant slaDueAt;

    @Column(name = "first_response_at")
    private Instant firstResponseAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "closed_at")
    private Instant closedAt;

    @Version
    @Column(nullable = false)
    private Long version = 0L;

    public Issue() {}

    public Issue(String ticketNo, UUID reporterId, UUID locationId, UUID assetId, String category,
                 String description, Short severity, boolean safetyFlag, Status status,
                 BigDecimal priorityScore, PriorityLevel priorityLevel, Map<String, Object> priorityExplanation,
                 String priorityOverrideReason, UUID departmentId, UUID assigneeId, UUID duplicateOfIssueId,
                 Instant slaDueAt, Instant firstResponseAt, Instant resolvedAt, Instant closedAt, Long version) {
        this.ticketNo = ticketNo;
        this.reporterId = reporterId;
        this.locationId = locationId;
        this.assetId = assetId;
        this.category = category;
        this.description = description;
        this.severity = severity;
        this.safetyFlag = safetyFlag;
        this.status = status != null ? status : Status.SUBMITTED;
        this.priorityScore = priorityScore;
        this.priorityLevel = priorityLevel;
        this.priorityExplanation = priorityExplanation;
        this.priorityOverrideReason = priorityOverrideReason;
        this.departmentId = departmentId;
        this.assigneeId = assigneeId;
        this.duplicateOfIssueId = duplicateOfIssueId;
        this.slaDueAt = slaDueAt;
        this.firstResponseAt = firstResponseAt;
        this.resolvedAt = resolvedAt;
        this.closedAt = closedAt;
        this.version = version != null ? version : 0L;
    }

    public static IssueBuilder builder() {
        return new IssueBuilder();
    }

    public static class IssueBuilder {
        private String ticketNo;
        private UUID reporterId;
        private UUID locationId;
        private UUID assetId;
        private String category;
        private String description;
        private Short severity;
        private boolean safetyFlag = false;
        private Status status = Status.SUBMITTED;
        private BigDecimal priorityScore;
        private PriorityLevel priorityLevel;
        private Map<String, Object> priorityExplanation;
        private String priorityOverrideReason;
        private UUID departmentId;
        private UUID assigneeId;
        private UUID duplicateOfIssueId;
        private Instant slaDueAt;
        private Instant firstResponseAt;
        private Instant resolvedAt;
        private Instant closedAt;
        private Long version = 0L;

        public IssueBuilder ticketNo(String ticketNo) { this.ticketNo = ticketNo; return this; }
        public IssueBuilder reporterId(UUID reporterId) { this.reporterId = reporterId; return this; }
        public IssueBuilder locationId(UUID locationId) { this.locationId = locationId; return this; }
        public IssueBuilder assetId(UUID assetId) { this.assetId = assetId; return this; }
        public IssueBuilder category(String category) { this.category = category; return this; }
        public IssueBuilder description(String description) { this.description = description; return this; }
        public IssueBuilder severity(Short severity) { this.severity = severity; return this; }
        public IssueBuilder safetyFlag(boolean safetyFlag) { this.safetyFlag = safetyFlag; return this; }
        public IssueBuilder status(Status status) { this.status = status; return this; }
        public IssueBuilder priorityScore(BigDecimal priorityScore) { this.priorityScore = priorityScore; return this; }
        public IssueBuilder priorityLevel(PriorityLevel priorityLevel) { this.priorityLevel = priorityLevel; return this; }
        public IssueBuilder priorityExplanation(Map<String, Object> priorityExplanation) { this.priorityExplanation = priorityExplanation; return this; }
        public IssueBuilder priorityOverrideReason(String priorityOverrideReason) { this.priorityOverrideReason = priorityOverrideReason; return this; }
        public IssueBuilder departmentId(UUID departmentId) { this.departmentId = departmentId; return this; }
        public IssueBuilder assigneeId(UUID assigneeId) { this.assigneeId = assigneeId; return this; }
        public IssueBuilder duplicateOfIssueId(UUID duplicateOfIssueId) { this.duplicateOfIssueId = duplicateOfIssueId; return this; }
        public IssueBuilder slaDueAt(Instant slaDueAt) { this.slaDueAt = slaDueAt; return this; }
        public IssueBuilder firstResponseAt(Instant firstResponseAt) { this.firstResponseAt = firstResponseAt; return this; }
        public IssueBuilder resolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; return this; }
        public IssueBuilder closedAt(Instant closedAt) { this.closedAt = closedAt; return this; }
        public IssueBuilder version(Long version) { this.version = version; return this; }

        public Issue build() {
            return new Issue(ticketNo, reporterId, locationId, assetId, category, description, severity,
                    safetyFlag, status, priorityScore, priorityLevel, priorityExplanation,
                    priorityOverrideReason, departmentId, assigneeId, duplicateOfIssueId,
                    slaDueAt, firstResponseAt, resolvedAt, closedAt, version);
        }
    }

    public String getTicketNo() { return ticketNo; }
    public void setTicketNo(String ticketNo) { this.ticketNo = ticketNo; }
    public UUID getReporterId() { return reporterId; }
    public void setReporterId(UUID reporterId) { this.reporterId = reporterId; }
    public UUID getLocationId() { return locationId; }
    public void setLocationId(UUID locationId) { this.locationId = locationId; }
    public UUID getAssetId() { return assetId; }
    public void setAssetId(UUID assetId) { this.assetId = assetId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Short getSeverity() { return severity; }
    public void setSeverity(Short severity) { this.severity = severity; }
    public boolean isSafetyFlag() { return safetyFlag; }
    public void setSafetyFlag(boolean safetyFlag) { this.safetyFlag = safetyFlag; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public BigDecimal getPriorityScore() { return priorityScore; }
    public void setPriorityScore(BigDecimal priorityScore) { this.priorityScore = priorityScore; }
    public PriorityLevel getPriorityLevel() { return priorityLevel; }
    public void setPriorityLevel(PriorityLevel priorityLevel) { this.priorityLevel = priorityLevel; }
    public Map<String, Object> getPriorityExplanation() { return priorityExplanation; }
    public void setPriorityExplanation(Map<String, Object> priorityExplanation) { this.priorityExplanation = priorityExplanation; }
    public String getPriorityOverrideReason() { return priorityOverrideReason; }
    public void setPriorityOverrideReason(String priorityOverrideReason) { this.priorityOverrideReason = priorityOverrideReason; }
    public UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }
    public UUID getAssigneeId() { return assigneeId; }
    public void setAssigneeId(UUID assigneeId) { this.assigneeId = assigneeId; }
    public UUID getDuplicateOfIssueId() { return duplicateOfIssueId; }
    public void setDuplicateOfIssueId(UUID duplicateOfIssueId) { this.duplicateOfIssueId = duplicateOfIssueId; }
    public Instant getSlaDueAt() { return slaDueAt; }
    public void setSlaDueAt(Instant slaDueAt) { this.slaDueAt = slaDueAt; }
    public Instant getFirstResponseAt() { return firstResponseAt; }
    public void setFirstResponseAt(Instant firstResponseAt) { this.firstResponseAt = firstResponseAt; }
    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
    public Instant getClosedAt() { return closedAt; }
    public void setClosedAt(Instant closedAt) { this.closedAt = closedAt; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}
