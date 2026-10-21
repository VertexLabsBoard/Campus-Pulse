package com.campuspulse.service;

import com.campuspulse.api.dto.IssueDtos.*;
import com.campuspulse.domain.*;
import com.campuspulse.exception.BadRequestException;
import com.campuspulse.exception.ForbiddenException;
import com.campuspulse.exception.NotFoundException;
import com.campuspulse.repository.*;
import com.campuspulse.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class IssueService {

    private static final Logger log = LoggerFactory.getLogger(IssueService.class);

    private final IssueRepository issueRepository;
    private final IssueSupporterRepository issueSupporterRepository;
    private final IssueCommentRepository issueCommentRepository;
    private final IssueStatusHistoryRepository issueStatusHistoryRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final BuildingRepository buildingRepository;
    private final DepartmentRepository departmentRepository;
    private final FeedbackRepository feedbackRepository;
    private final AuthService authService;

    public IssueService(
            IssueRepository issueRepository,
            IssueSupporterRepository issueSupporterRepository,
            IssueCommentRepository issueCommentRepository,
            IssueStatusHistoryRepository issueStatusHistoryRepository,
            AuditLogRepository auditLogRepository,
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            LocationRepository locationRepository,
            BuildingRepository buildingRepository,
            DepartmentRepository departmentRepository,
            FeedbackRepository feedbackRepository,
            AuthService authService) {
        this.issueRepository = issueRepository;
        this.issueSupporterRepository = issueSupporterRepository;
        this.issueCommentRepository = issueCommentRepository;
        this.issueStatusHistoryRepository = issueStatusHistoryRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
        this.buildingRepository = buildingRepository;
        this.departmentRepository = departmentRepository;
        this.feedbackRepository = feedbackRepository;
        this.authService = authService;
    }

    // Allowed status transitions per PROJECT_SPEC.md §6
    private static final Map<Issue.Status, Set<Issue.Status>> VALID_TRANSITIONS = Map.of(
            Issue.Status.SUBMITTED, Set.of(Issue.Status.VERIFIED, Issue.Status.REJECTED, Issue.Status.DUPLICATE),
            Issue.Status.VERIFIED, Set.of(Issue.Status.ASSIGNED, Issue.Status.REJECTED),
            Issue.Status.ASSIGNED, Set.of(Issue.Status.IN_PROGRESS, Issue.Status.REJECTED),
            Issue.Status.IN_PROGRESS, Set.of(Issue.Status.RESOLVED),
            Issue.Status.RESOLVED, Set.of(Issue.Status.CLOSED, Issue.Status.REOPENED),
            Issue.Status.REOPENED, Set.of(Issue.Status.ASSIGNED, Issue.Status.IN_PROGRESS),
            Issue.Status.CLOSED, Set.of(Issue.Status.REOPENED),
            Issue.Status.REJECTED, Set.of(Issue.Status.VERIFIED),
            Issue.Status.DUPLICATE, Set.of()
    );

    @Transactional
    public IssueResponseDto createIssue(CreateIssueRequest request) {
        UserPrincipal principal = authService.getCurrentPrincipal();

        // 1. Rate limiting: max 10 reports per user per 24 hours
        long recentReports = issueRepository.countReportsSince(
                principal.getId(), Instant.now().minus(24, ChronoUnit.HOURS));
        if (recentReports >= 10) {
            throw new BadRequestException("Rate limit reached: Maximum 10 reports per 24 hours.");
        }

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new NotFoundException("Location not found"));

        // 2. Department routing suggestion
        UUID deptId = suggestDepartment(request.getCategory(), request.getDescription());

        // 3. Calculate priority score and explainable reasons
        PriorityResult priority = calculatePriority(request.getSeverity(), request.isSafetyFlag(), 0, request.getCategory());

        Issue issue = Issue.builder()
                .ticketNo("CP-" + (1000 + (long)(Math.random() * 9000)))
                .reporterId(principal.getId())
                .locationId(location.getId())
                .assetId(request.getAssetId())
                .category(request.getCategory())
                .description(request.getDescription())
                .severity(request.getSeverity())
                .safetyFlag(request.isSafetyFlag() || priority.level == Issue.PriorityLevel.CRITICAL)
                .status(Issue.Status.SUBMITTED)
                .priorityScore(BigDecimal.valueOf(priority.score).setScale(2, RoundingMode.HALF_UP))
                .priorityLevel(priority.level)
                .priorityExplanation(priority.toMap())
                .departmentId(deptId)
                .build();

        issue = issueRepository.save(issue);

        // Record initial status history
        issueStatusHistoryRepository.save(IssueStatusHistory.builder()
                .issueId(issue.getId())
                .fromStatus(null)
                .toStatus(Issue.Status.SUBMITTED)
                .changedBy(principal.getId())
                .reason("Report filed by student")
                .build());

        // Record audit log
        auditLogRepository.save(AuditLog.builder()
                .actorId(principal.getId())
                .action("CREATE_ISSUE")
                .entityType("ISSUE")
                .entityId(issue.getId())
                .afterVal(Map.of("ticketNo", issue.getTicketNo(), "status", "SUBMITTED", "priority", priority.level.name()))
                .build());

        return mapToDto(issue, principal.getId());
    }

    @Transactional(readOnly = true)
    public List<IssueResponseDto> listIssues(
            Issue.Status status,
            String category,
            Issue.PriorityLevel priority,
            UUID locationId,
            UUID departmentId,
            Boolean mine) {

        UserPrincipal principal = authService.getOptionalPrincipal().orElse(null);

        List<Issue> issues = issueRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));

        return issues.stream()
                .filter(i -> status == null || i.getStatus() == status)
                .filter(i -> category == null || category.isBlank() || i.getCategory().equalsIgnoreCase(category))
                .filter(i -> priority == null || i.getPriorityLevel() == priority)
                .filter(i -> locationId == null || i.getLocationId().equals(locationId))
                .filter(i -> departmentId == null || (i.getDepartmentId() != null && i.getDepartmentId().equals(departmentId)))
                .filter(i -> {
                    if (Boolean.TRUE.equals(mine)) {
                        return principal != null && i.getReporterId().equals(principal.getId());
                    }
                    return true;
                })
                .map(i -> mapToDto(i, principal != null ? principal.getId() : null))
                .toList();
    }

    @Transactional(readOnly = true)
    public IssueResponseDto getIssue(UUID issueId) {
        UserPrincipal principal = authService.getOptionalPrincipal().orElse(null);
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new NotFoundException("Issue not found"));

        return mapToDto(issue, principal != null ? principal.getId() : null);
    }

    @Transactional
    public boolean toggleSupport(UUID issueId) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new NotFoundException("Issue not found"));

        boolean supported = issueSupporterRepository.existsByIssueIdAndUserId(issueId, principal.getId());
        if (supported) {
            issueSupporterRepository.deleteByIssueIdAndUserId(issueId, principal.getId());
        } else {
            issueSupporterRepository.save(IssueSupporter.builder()
                    .issueId(issueId)
                    .userId(principal.getId())
                    .build());
        }

        // Recalculate priority based on new supporter count
        long supporterCount = issueSupporterRepository.countByIssueId(issueId);
        PriorityResult priority = calculatePriority(issue.getSeverity(), issue.isSafetyFlag(), supporterCount, issue.getCategory());
        issue.setPriorityScore(BigDecimal.valueOf(priority.score).setScale(2, RoundingMode.HALF_UP));
        if (issue.getPriorityOverrideReason() == null) {
            issue.setPriorityLevel(priority.level);
        }
        issue.setPriorityExplanation(priority.toMap());
        issueRepository.save(issue);

        return !supported;
    }

    @Transactional
    public IssueResponseDto changeStatus(UUID issueId, ChangeStatusRequest req) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new NotFoundException("Issue not found"));

        // Validate role access
        if (principal.getRole() == User.Role.STUDENT) {
            if (req.getToStatus() != Issue.Status.CLOSED && req.getToStatus() != Issue.Status.REOPENED) {
                throw new ForbiddenException("Students can only confirm fix (close) or reopen an issue");
            }
        } else if (principal.getRole() == User.Role.STAFF) {
            if (issue.getDepartmentId() != null && principal.getDepartmentId() != null
                    && !issue.getDepartmentId().equals(principal.getDepartmentId())) {
                throw new ForbiddenException("Staff can only transition issues assigned to their department");
            }
        }

        // Validate state machine
        Set<Issue.Status> validNext = VALID_TRANSITIONS.getOrDefault(issue.getStatus(), Set.of());
        if (!validNext.contains(req.getToStatus())) {
            throw new BadRequestException("Invalid transition from " + issue.getStatus() + " to " + req.getToStatus());
        }

        Issue.Status oldStatus = issue.getStatus();
        issue.setStatus(req.getToStatus());

        if (req.getToStatus() == Issue.Status.IN_PROGRESS && issue.getFirstResponseAt() == null) {
            issue.setFirstResponseAt(Instant.now());
        }
        if (req.getToStatus() == Issue.Status.RESOLVED) {
            issue.setResolvedAt(Instant.now());
        }
        if (req.getToStatus() == Issue.Status.CLOSED) {
            issue.setClosedAt(Instant.now());
        }

        issue = issueRepository.save(issue);

        // Record history
        issueStatusHistoryRepository.save(IssueStatusHistory.builder()
                .issueId(issue.getId())
                .fromStatus(oldStatus)
                .toStatus(req.getToStatus())
                .changedBy(principal.getId())
                .reason(req.getReason() != null ? req.getReason() : "Status updated by " + principal.getRole())
                .build());

        // Notify reporter
        notificationRepository.save(Notification.builder()
                .userId(issue.getReporterId())
                .issueId(issue.getId())
                .type("STATUS_UPDATE")
                .message("Issue " + issue.getTicketNo() + " status changed to " + req.getToStatus() +
                        (req.getReason() != null ? ": " + req.getReason() : ""))
                .build());

        // Audit log
        auditLogRepository.save(AuditLog.builder()
                .actorId(principal.getId())
                .action("CHANGE_STATUS")
                .entityType("ISSUE")
                .entityId(issue.getId())
                .beforeVal(Map.of("status", oldStatus.name()))
                .afterVal(Map.of("status", req.getToStatus().name(), "reason", req.getReason() != null ? req.getReason() : ""))
                .build());

        return mapToDto(issue, principal.getId());
    }

    @Transactional
    public IssueResponseDto assignIssue(UUID issueId, AssignRequest req) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        if (principal.getRole() == User.Role.STUDENT) {
            throw new ForbiddenException("Students cannot assign issues");
        }

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new NotFoundException("Issue not found"));

        if (req.getDepartmentId() != null) {
            issue.setDepartmentId(req.getDepartmentId());
        }
        if (req.getAssigneeId() != null) {
            issue.setAssigneeId(req.getAssigneeId());
            if (issue.getStatus() == Issue.Status.SUBMITTED || issue.getStatus() == Issue.Status.VERIFIED) {
                issue.setStatus(Issue.Status.ASSIGNED);
            }

            notificationRepository.save(Notification.builder()
                    .userId(req.getAssigneeId())
                    .issueId(issue.getId())
                    .type("ASSIGNED")
                    .message("You have been assigned to issue " + issue.getTicketNo() + ": " + issue.getDescription())
                    .build());
        }

        issue = issueRepository.save(issue);
        return mapToDto(issue, principal.getId());
    }

    @Transactional
    public IssueResponseDto overridePriority(UUID issueId, OverridePriorityRequest req) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        if (principal.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Only administrators can override issue priority");
        }

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new NotFoundException("Issue not found"));

        issue.setPriorityLevel(req.getPriorityLevel());
        issue.setPriorityOverrideReason(req.getReason());
        issue = issueRepository.save(issue);

        auditLogRepository.save(AuditLog.builder()
                .actorId(principal.getId())
                .action("OVERRIDE_PRIORITY")
                .entityType("ISSUE")
                .entityId(issue.getId())
                .afterVal(Map.of("priorityLevel", req.getPriorityLevel().name(), "reason", req.getReason()))
                .build());

        return mapToDto(issue, principal.getId());
    }

    @Transactional
    public IssueResponseDto confirmResolution(UUID issueId, FeedbackRequest req) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new NotFoundException("Issue not found"));

        if (!issue.getReporterId().equals(principal.getId()) && principal.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Only the reporter can confirm or reopen this issue");
        }

        feedbackRepository.save(Feedback.builder()
                .issueId(issueId)
                .userId(principal.getId())
                .fixedConfirmed(req.getFixedConfirmed())
                .rating(req.getRating())
                .comment(req.getComment())
                .build());

        if (Boolean.TRUE.equals(req.getFixedConfirmed())) {
            return changeStatus(issueId, new ChangeStatusRequest(Issue.Status.CLOSED, "Confirmed fixed by student. Rating: " + req.getRating() + "/5"));
        } else {
            return changeStatus(issueId, new ChangeStatusRequest(Issue.Status.REOPENED, "Reopened by student: " + (req.getComment() != null ? req.getComment() : "Issue remains unresolved")));
        }
    }

    @Transactional
    public CommentDto addComment(UUID issueId, AddCommentRequest req) {
        UserPrincipal principal = authService.getCurrentPrincipal();
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new NotFoundException("Issue not found"));

        if (req.isInternal() && principal.getRole() == User.Role.STUDENT) {
            throw new ForbiddenException("Students cannot post internal staff notes");
        }

        IssueComment comment = issueCommentRepository.save(IssueComment.builder()
                .issueId(issueId)
                .authorId(principal.getId())
                .body(req.getBody())
                .internal(req.isInternal())
                .build());

        // Notify reporter if comment was by staff
        if (!principal.getId().equals(issue.getReporterId()) && !req.isInternal()) {
            notificationRepository.save(Notification.builder()
                    .userId(issue.getReporterId())
                    .issueId(issue.getId())
                    .type("COMMENT")
                    .message("New update on issue " + issue.getTicketNo() + " from " + principal.getName())
                    .build());
        }

        return CommentDto.builder()
                .id(comment.getId())
                .authorId(principal.getId())
                .authorName(principal.getName())
                .authorRole(principal.getRole().name())
                .body(comment.getBody())
                .internal(comment.isInternal())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    private IssueResponseDto mapToDto(Issue issue, UUID viewerId) {
        Location loc = locationRepository.findById(issue.getLocationId()).orElse(null);
        Building b = loc != null ? buildingRepository.findById(loc.getBuildingId()).orElse(null) : null;
        User reporter = userRepository.findById(issue.getReporterId()).orElse(null);
        User assignee = issue.getAssigneeId() != null ? userRepository.findById(issue.getAssigneeId()).orElse(null) : null;
        Department dept = issue.getDepartmentId() != null ? departmentRepository.findById(issue.getDepartmentId()).orElse(null) : null;

        long supporterCount = issueSupporterRepository.countByIssueId(issue.getId());
        boolean userHasSupported = viewerId != null && issueSupporterRepository.existsByIssueIdAndUserId(issue.getId(), viewerId);

        // Comments (filter internal notes if viewer is a student)
        boolean isStaffOrAdmin = viewerId != null && userRepository.findById(viewerId)
                .map(u -> u.getRole() != User.Role.STUDENT).orElse(false);

        List<IssueComment> rawComments = isStaffOrAdmin
                ? issueCommentRepository.findByIssueIdOrderByCreatedAtAsc(issue.getId())
                : issueCommentRepository.findByIssueIdAndInternalFalseOrderByCreatedAtAsc(issue.getId());

        List<CommentDto> comments = rawComments.stream().map(c -> {
            User author = userRepository.findById(c.getAuthorId()).orElse(null);
            return CommentDto.builder()
                    .id(c.getId())
                    .authorId(c.getAuthorId())
                    .authorName(author != null ? author.getName() : "Campus User")
                    .authorRole(author != null ? author.getRole().name() : "STUDENT")
                    .body(c.getBody())
                    .internal(c.isInternal())
                    .createdAt(c.getCreatedAt())
                    .build();
        }).toList();

        List<StatusHistoryDto> history = issueStatusHistoryRepository.findByIssueIdOrderByChangedAtAsc(issue.getId())
                .stream().map(h -> {
                    User user = userRepository.findById(h.getChangedBy()).orElse(null);
                    return StatusHistoryDto.builder()
                            .id(h.getId())
                            .fromStatus(h.getFromStatus())
                            .toStatus(h.getToStatus())
                            .changedBy(h.getChangedBy())
                            .changedByName(user != null ? user.getName() : "System")
                            .reason(h.getReason())
                            .changedAt(h.getChangedAt())
                            .build();
                }).toList();

        return IssueResponseDto.builder()
                .id(issue.getId())
                .ticketNo(issue.getTicketNo())
                .reporterId(issue.getReporterId())
                .reporterName(reporter != null ? (reporter.isHideNameFromStudents() && !isStaffOrAdmin ? "Anonymous Student" : reporter.getName()) : "Reporter")
                .locationId(issue.getLocationId())
                .locationName(loc != null ? loc.getName() : "Room")
                .roomCode(loc != null ? loc.getRoomCode() : "")
                .buildingName(b != null ? b.getName() : "")
                .assetId(issue.getAssetId())
                .category(issue.getCategory())
                .description(issue.getDescription())
                .severity(issue.getSeverity())
                .safetyFlag(issue.isSafetyFlag())
                .status(issue.getStatus())
                .priorityScore(issue.getPriorityScore())
                .priorityLevel(issue.getPriorityLevel())
                .priorityExplanation(issue.getPriorityExplanation())
                .priorityOverrideReason(issue.getPriorityOverrideReason())
                .departmentId(issue.getDepartmentId())
                .departmentName(dept != null ? dept.getName() : "Unassigned")
                .assigneeId(issue.getAssigneeId())
                .assigneeName(assignee != null ? assignee.getName() : "Unassigned")
                .supporterCount(supporterCount)
                .userHasSupported(userHasSupported)
                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .resolvedAt(issue.getResolvedAt())
                .closedAt(issue.getClosedAt())
                .comments(comments)
                .history(history)
                .build();
    }

    private record PriorityResult(double score, Issue.PriorityLevel level, List<String> reasons) {
        Map<String, Object> toMap() {
            return Map.of("score", score, "level", level.name(), "reasons", reasons);
        }
    }

    private PriorityResult calculatePriority(short severity, boolean safetyFlag, long supporterCount, String category) {
        double score = 0;
        List<String> reasons = new ArrayList<>();

        // 1. Severity points (up to 35)
        double sevPoints = (severity / 5.0) * 35.0;
        score += sevPoints;
        reasons.add(String.format("+%.0f Severity: %d/5", sevPoints, severity));

        // 2. Supporters / Affected people (up to 20 points with diminishing returns)
        double supporterPoints = Math.min(supporterCount * 4.0, 20.0);
        if (supporterPoints > 0) {
            score += supporterPoints;
            reasons.add(String.format("+%.0f Affected: %d people supported this report", supporterPoints, supporterCount));
        }

        // 3. Category base weighting
        if ("Electrical".equalsIgnoreCase(category)) {
            score += 20;
            reasons.add("+20 Critical hazard category: Electrical");
        } else if ("Maintenance".equalsIgnoreCase(category)) {
            score += 10;
            reasons.add("+10 Campus infrastructure category: Maintenance");
        }

        // 4. Safety override
        Issue.PriorityLevel level;
        if (safetyFlag || "Electrical".equalsIgnoreCase(category) || score >= 80) {
            score = Math.max(score, 85);
            level = Issue.PriorityLevel.CRITICAL;
            if (safetyFlag) reasons.add("+Safety Hazard Flag: Escalated directly to CRITICAL");
        } else if (score >= 60) {
            level = Issue.PriorityLevel.HIGH;
        } else if (score >= 40) {
            level = Issue.PriorityLevel.MEDIUM;
        } else {
            level = Issue.PriorityLevel.LOW;
        }

        return new PriorityResult(score, level, reasons);
    }

    private UUID suggestDepartment(String category, String description) {
        String combined = (category + " " + description).toLowerCase();
        String deptName;

        if (combined.contains("wifi") || combined.contains("internet") || combined.contains("projector")
                || combined.contains("pc") || combined.contains("monitor") || combined.contains("computer")) {
            deptName = "IT";
        } else if (combined.contains("clean") || combined.contains("trash") || combined.contains("garbage")
                || combined.contains("washroom") || combined.contains("toilet") || combined.contains("dust")) {
            deptName = "Housekeeping";
        } else if (combined.contains("light") || combined.contains("power") || combined.contains("spark")
                || combined.contains("socket") || combined.contains("switch") || combined.contains("fan") || combined.contains("ac")) {
            deptName = "Electrical";
        } else if (combined.contains("microscope") || combined.contains("glass") || combined.contains("chemical") || combined.contains("lab")) {
            deptName = "Lab";
        } else {
            deptName = "Maintenance";
        }

        return departmentRepository.findByName(deptName)
                .map(Department::getId)
                .orElse(null);
    }
}
