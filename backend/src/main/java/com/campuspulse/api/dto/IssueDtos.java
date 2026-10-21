package com.campuspulse.api.dto;

import com.campuspulse.domain.Issue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class IssueDtos {

    public static class CreateIssueRequest {
        @NotNull(message = "Location is required")
        private UUID locationId;

        private UUID assetId;

        @NotBlank(message = "Category is required")
        private String category;

        @NotBlank(message = "Description is required")
        private String description;

        @Min(value = 1, message = "Severity must be between 1 and 5")
        @Max(value = 5, message = "Severity must be between 1 and 5")
        private short severity;

        private boolean safetyFlag;

        public CreateIssueRequest() {}

        public CreateIssueRequest(UUID locationId, UUID assetId, String category, String description, short severity, boolean safetyFlag) {
            this.locationId = locationId;
            this.assetId = assetId;
            this.category = category;
            this.description = description;
            this.severity = severity;
            this.safetyFlag = safetyFlag;
        }

        public static CreateIssueRequestBuilder builder() { return new CreateIssueRequestBuilder(); }

        public static class CreateIssueRequestBuilder {
            private UUID locationId;
            private UUID assetId;
            private String category;
            private String description;
            private short severity;
            private boolean safetyFlag;

            public CreateIssueRequestBuilder locationId(UUID locationId) { this.locationId = locationId; return this; }
            public CreateIssueRequestBuilder assetId(UUID assetId) { this.assetId = assetId; return this; }
            public CreateIssueRequestBuilder category(String category) { this.category = category; return this; }
            public CreateIssueRequestBuilder description(String description) { this.description = description; return this; }
            public CreateIssueRequestBuilder severity(short severity) { this.severity = severity; return this; }
            public CreateIssueRequestBuilder safetyFlag(boolean safetyFlag) { this.safetyFlag = safetyFlag; return this; }

            public CreateIssueRequest build() {
                return new CreateIssueRequest(locationId, assetId, category, description, severity, safetyFlag);
            }
        }

        public UUID getLocationId() { return locationId; }
        public void setLocationId(UUID locationId) { this.locationId = locationId; }
        public UUID getAssetId() { return assetId; }
        public void setAssetId(UUID assetId) { this.assetId = assetId; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public short getSeverity() { return severity; }
        public void setSeverity(short severity) { this.severity = severity; }
        public boolean isSafetyFlag() { return safetyFlag; }
        public void setSafetyFlag(boolean safetyFlag) { this.safetyFlag = safetyFlag; }
    }

    public static class IssueResponseDto {
        private UUID id;
        private String ticketNo;
        private UUID reporterId;
        private String reporterName;
        private UUID locationId;
        private String locationName;
        private String roomCode;
        private String buildingName;
        private UUID assetId;
        private String category;
        private String description;
        private short severity;
        private boolean safetyFlag;
        private Issue.Status status;
        private BigDecimal priorityScore;
        private Issue.PriorityLevel priorityLevel;
        private Map<String, Object> priorityExplanation;
        private String priorityOverrideReason;
        private UUID departmentId;
        private String departmentName;
        private UUID assigneeId;
        private String assigneeName;
        private long supporterCount;
        private boolean userHasSupported;
        private Instant createdAt;
        private Instant updatedAt;
        private Instant resolvedAt;
        private Instant closedAt;
        private List<CommentDto> comments;
        private List<StatusHistoryDto> history;

        public IssueResponseDto() {}

        public static IssueResponseDtoBuilder builder() { return new IssueResponseDtoBuilder(); }

        public static class IssueResponseDtoBuilder {
            private IssueResponseDto dto = new IssueResponseDto();

            public IssueResponseDtoBuilder id(UUID id) { dto.id = id; return this; }
            public IssueResponseDtoBuilder ticketNo(String ticketNo) { dto.ticketNo = ticketNo; return this; }
            public IssueResponseDtoBuilder reporterId(UUID reporterId) { dto.reporterId = reporterId; return this; }
            public IssueResponseDtoBuilder reporterName(String reporterName) { dto.reporterName = reporterName; return this; }
            public IssueResponseDtoBuilder locationId(UUID locationId) { dto.locationId = locationId; return this; }
            public IssueResponseDtoBuilder locationName(String locationName) { dto.locationName = locationName; return this; }
            public IssueResponseDtoBuilder roomCode(String roomCode) { dto.roomCode = roomCode; return this; }
            public IssueResponseDtoBuilder buildingName(String buildingName) { dto.buildingName = buildingName; return this; }
            public IssueResponseDtoBuilder assetId(UUID assetId) { dto.assetId = assetId; return this; }
            public IssueResponseDtoBuilder category(String category) { dto.category = category; return this; }
            public IssueResponseDtoBuilder description(String description) { dto.description = description; return this; }
            public IssueResponseDtoBuilder severity(short severity) { dto.severity = severity; return this; }
            public IssueResponseDtoBuilder safetyFlag(boolean safetyFlag) { dto.safetyFlag = safetyFlag; return this; }
            public IssueResponseDtoBuilder status(Issue.Status status) { dto.status = status; return this; }
            public IssueResponseDtoBuilder priorityScore(BigDecimal priorityScore) { dto.priorityScore = priorityScore; return this; }
            public IssueResponseDtoBuilder priorityLevel(Issue.PriorityLevel priorityLevel) { dto.priorityLevel = priorityLevel; return this; }
            public IssueResponseDtoBuilder priorityExplanation(Map<String, Object> priorityExplanation) { dto.priorityExplanation = priorityExplanation; return this; }
            public IssueResponseDtoBuilder priorityOverrideReason(String priorityOverrideReason) { dto.priorityOverrideReason = priorityOverrideReason; return this; }
            public IssueResponseDtoBuilder departmentId(UUID departmentId) { dto.departmentId = departmentId; return this; }
            public IssueResponseDtoBuilder departmentName(String departmentName) { dto.departmentName = departmentName; return this; }
            public IssueResponseDtoBuilder assigneeId(UUID assigneeId) { dto.assigneeId = assigneeId; return this; }
            public IssueResponseDtoBuilder assigneeName(String assigneeName) { dto.assigneeName = assigneeName; return this; }
            public IssueResponseDtoBuilder supporterCount(long supporterCount) { dto.supporterCount = supporterCount; return this; }
            public IssueResponseDtoBuilder userHasSupported(boolean userHasSupported) { dto.userHasSupported = userHasSupported; return this; }
            public IssueResponseDtoBuilder createdAt(Instant createdAt) { dto.createdAt = createdAt; return this; }
            public IssueResponseDtoBuilder updatedAt(Instant updatedAt) { dto.updatedAt = updatedAt; return this; }
            public IssueResponseDtoBuilder resolvedAt(Instant resolvedAt) { dto.resolvedAt = resolvedAt; return this; }
            public IssueResponseDtoBuilder closedAt(Instant closedAt) { dto.closedAt = closedAt; return this; }
            public IssueResponseDtoBuilder comments(List<CommentDto> comments) { dto.comments = comments; return this; }
            public IssueResponseDtoBuilder history(List<StatusHistoryDto> history) { dto.history = history; return this; }

            public IssueResponseDto build() { return dto; }
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getTicketNo() { return ticketNo; }
        public void setTicketNo(String ticketNo) { this.ticketNo = ticketNo; }
        public UUID getReporterId() { return reporterId; }
        public void setReporterId(UUID reporterId) { this.reporterId = reporterId; }
        public String getReporterName() { return reporterName; }
        public void setReporterName(String reporterName) { this.reporterName = reporterName; }
        public UUID getLocationId() { return locationId; }
        public void setLocationId(UUID locationId) { this.locationId = locationId; }
        public String getLocationName() { return locationName; }
        public void setLocationName(String locationName) { this.locationName = locationName; }
        public String getRoomCode() { return roomCode; }
        public void setRoomCode(String roomCode) { this.roomCode = roomCode; }
        public String getBuildingName() { return buildingName; }
        public void setBuildingName(String buildingName) { this.buildingName = buildingName; }
        public UUID getAssetId() { return assetId; }
        public void setAssetId(UUID assetId) { this.assetId = assetId; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public short getSeverity() { return severity; }
        public void setSeverity(short severity) { this.severity = severity; }
        public boolean isSafetyFlag() { return safetyFlag; }
        public void setSafetyFlag(boolean safetyFlag) { this.safetyFlag = safetyFlag; }
        public Issue.Status getStatus() { return status; }
        public void setStatus(Issue.Status status) { this.status = status; }
        public BigDecimal getPriorityScore() { return priorityScore; }
        public void setPriorityScore(BigDecimal priorityScore) { this.priorityScore = priorityScore; }
        public Issue.PriorityLevel getPriorityLevel() { return priorityLevel; }
        public void setPriorityLevel(Issue.PriorityLevel priorityLevel) { this.priorityLevel = priorityLevel; }
        public Map<String, Object> getPriorityExplanation() { return priorityExplanation; }
        public void setPriorityExplanation(Map<String, Object> priorityExplanation) { this.priorityExplanation = priorityExplanation; }
        public String getPriorityOverrideReason() { return priorityOverrideReason; }
        public void setPriorityOverrideReason(String priorityOverrideReason) { this.priorityOverrideReason = priorityOverrideReason; }
        public UUID getDepartmentId() { return departmentId; }
        public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }
        public String getDepartmentName() { return departmentName; }
        public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
        public UUID getAssigneeId() { return assigneeId; }
        public void setAssigneeId(UUID assigneeId) { this.assigneeId = assigneeId; }
        public String getAssigneeName() { return assigneeName; }
        public void setAssigneeName(String assigneeName) { this.assigneeName = assigneeName; }
        public long getSupporterCount() { return supporterCount; }
        public void setSupporterCount(long supporterCount) { this.supporterCount = supporterCount; }
        public boolean isUserHasSupported() { return userHasSupported; }
        public void setUserHasSupported(boolean userHasSupported) { this.userHasSupported = userHasSupported; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
        public Instant getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
        public Instant getResolvedAt() { return resolvedAt; }
        public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
        public Instant getClosedAt() { return closedAt; }
        public void setClosedAt(Instant closedAt) { this.closedAt = closedAt; }
        public List<CommentDto> getComments() { return comments; }
        public void setComments(List<CommentDto> comments) { this.comments = comments; }
        public List<StatusHistoryDto> getHistory() { return history; }
        public void setHistory(List<StatusHistoryDto> history) { this.history = history; }
    }

    public static class CommentDto {
        private UUID id;
        private UUID authorId;
        private String authorName;
        private String authorRole;
        private String body;
        private boolean internal;
        private Instant createdAt;

        public CommentDto() {}

        public CommentDto(UUID id, UUID authorId, String authorName, String authorRole, String body, boolean internal, Instant createdAt) {
            this.id = id;
            this.authorId = authorId;
            this.authorName = authorName;
            this.authorRole = authorRole;
            this.body = body;
            this.internal = internal;
            this.createdAt = createdAt;
        }

        public static CommentDtoBuilder builder() { return new CommentDtoBuilder(); }

        public static class CommentDtoBuilder {
            private UUID id;
            private UUID authorId;
            private String authorName;
            private String authorRole;
            private String body;
            private boolean internal;
            private Instant createdAt;

            public CommentDtoBuilder id(UUID id) { this.id = id; return this; }
            public CommentDtoBuilder authorId(UUID authorId) { this.authorId = authorId; return this; }
            public CommentDtoBuilder authorName(String authorName) { this.authorName = authorName; return this; }
            public CommentDtoBuilder authorRole(String authorRole) { this.authorRole = authorRole; return this; }
            public CommentDtoBuilder body(String body) { this.body = body; return this; }
            public CommentDtoBuilder internal(boolean internal) { this.internal = internal; return this; }
            public CommentDtoBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

            public CommentDto build() {
                return new CommentDto(id, authorId, authorName, authorRole, body, internal, createdAt);
            }
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public UUID getAuthorId() { return authorId; }
        public void setAuthorId(UUID authorId) { this.authorId = authorId; }
        public String getAuthorName() { return authorName; }
        public void setAuthorName(String authorName) { this.authorName = authorName; }
        public String getAuthorRole() { return authorRole; }
        public void setAuthorRole(String authorRole) { this.authorRole = authorRole; }
        public String getBody() { return body; }
        public void setBody(String body) { this.body = body; }
        public boolean isInternal() { return internal; }
        public void setInternal(boolean internal) { this.internal = internal; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }

    public static class StatusHistoryDto {
        private UUID id;
        private Issue.Status fromStatus;
        private Issue.Status toStatus;
        private UUID changedBy;
        private String changedByName;
        private String reason;
        private Instant changedAt;

        public StatusHistoryDto() {}

        public StatusHistoryDto(UUID id, Issue.Status fromStatus, Issue.Status toStatus, UUID changedBy, String changedByName, String reason, Instant changedAt) {
            this.id = id;
            this.fromStatus = fromStatus;
            this.toStatus = toStatus;
            this.changedBy = changedBy;
            this.changedByName = changedByName;
            this.reason = reason;
            this.changedAt = changedAt;
        }

        public static StatusHistoryDtoBuilder builder() { return new StatusHistoryDtoBuilder(); }

        public static class StatusHistoryDtoBuilder {
            private UUID id;
            private Issue.Status fromStatus;
            private Issue.Status toStatus;
            private UUID changedBy;
            private String changedByName;
            private String reason;
            private Instant changedAt;

            public StatusHistoryDtoBuilder id(UUID id) { this.id = id; return this; }
            public StatusHistoryDtoBuilder fromStatus(Issue.Status fromStatus) { this.fromStatus = fromStatus; return this; }
            public StatusHistoryDtoBuilder toStatus(Issue.Status toStatus) { this.toStatus = toStatus; return this; }
            public StatusHistoryDtoBuilder changedBy(UUID changedBy) { this.changedBy = changedBy; return this; }
            public StatusHistoryDtoBuilder changedByName(String changedByName) { this.changedByName = changedByName; return this; }
            public StatusHistoryDtoBuilder reason(String reason) { this.reason = reason; return this; }
            public StatusHistoryDtoBuilder changedAt(Instant changedAt) { this.changedAt = changedAt; return this; }

            public StatusHistoryDto build() {
                return new StatusHistoryDto(id, fromStatus, toStatus, changedBy, changedByName, reason, changedAt);
            }
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public Issue.Status getFromStatus() { return fromStatus; }
        public void setFromStatus(Issue.Status fromStatus) { this.fromStatus = fromStatus; }
        public Issue.Status getToStatus() { return toStatus; }
        public void setToStatus(Issue.Status toStatus) { this.toStatus = toStatus; }
        public UUID getChangedBy() { return changedBy; }
        public void setChangedBy(UUID changedBy) { this.changedBy = changedBy; }
        public String getChangedByName() { return changedByName; }
        public void setChangedByName(String changedByName) { this.changedByName = changedByName; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public Instant getChangedAt() { return changedAt; }
        public void setChangedAt(Instant changedAt) { this.changedAt = changedAt; }
    }

    public static class ChangeStatusRequest {
        @NotNull(message = "Target status is required")
        private Issue.Status toStatus;
        private String reason;

        public ChangeStatusRequest() {}
        public ChangeStatusRequest(Issue.Status toStatus, String reason) {
            this.toStatus = toStatus;
            this.reason = reason;
        }

        public Issue.Status getToStatus() { return toStatus; }
        public void setToStatus(Issue.Status toStatus) { this.toStatus = toStatus; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class AssignRequest {
        private UUID departmentId;
        private UUID assigneeId;

        public AssignRequest() {}
        public AssignRequest(UUID departmentId, UUID assigneeId) {
            this.departmentId = departmentId;
            this.assigneeId = assigneeId;
        }

        public UUID getDepartmentId() { return departmentId; }
        public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }
        public UUID getAssigneeId() { return assigneeId; }
        public void setAssigneeId(UUID assigneeId) { this.assigneeId = assigneeId; }
    }

    public static class OverridePriorityRequest {
        @NotNull(message = "Priority level is required")
        private Issue.PriorityLevel priorityLevel;
        @NotBlank(message = "Written reason is required for priority override")
        private String reason;

        public OverridePriorityRequest() {}
        public OverridePriorityRequest(Issue.PriorityLevel priorityLevel, String reason) {
            this.priorityLevel = priorityLevel;
            this.reason = reason;
        }

        public Issue.PriorityLevel getPriorityLevel() { return priorityLevel; }
        public void setPriorityLevel(Issue.PriorityLevel priorityLevel) { this.priorityLevel = priorityLevel; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class FeedbackRequest {
        @NotNull(message = "fixedConfirmed is required")
        private Boolean fixedConfirmed;
        private Short rating;
        private String comment;

        public FeedbackRequest() {}
        public FeedbackRequest(Boolean fixedConfirmed, Short rating, String comment) {
            this.fixedConfirmed = fixedConfirmed;
            this.rating = rating;
            this.comment = comment;
        }

        public Boolean getFixedConfirmed() { return fixedConfirmed; }
        public void setFixedConfirmed(Boolean fixedConfirmed) { this.fixedConfirmed = fixedConfirmed; }
        public Short getRating() { return rating; }
        public void setRating(Short rating) { this.rating = rating; }
        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
    }

    public static class AddCommentRequest {
        @NotBlank(message = "Comment body cannot be blank")
        private String body;
        private boolean internal;

        public AddCommentRequest() {}
        public AddCommentRequest(String body, boolean internal) {
            this.body = body;
            this.internal = internal;
        }

        public String getBody() { return body; }
        public void setBody(String body) { this.body = body; }
        public boolean isInternal() { return internal; }
        public void setInternal(boolean internal) { this.internal = internal; }
    }
}
