package com.campuspulse.api;

import com.campuspulse.api.dto.IssueDtos.*;
import com.campuspulse.domain.Issue;
import com.campuspulse.service.IssueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/issues")
@Tag(name = "Issues", description = "Issue reporting, status workflows, comments, and priority endpoints")
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    @PostMapping
    @Operation(summary = "Report a new campus issue (under 30s form)")
    public ResponseEntity<IssueResponseDto> createIssue(@Valid @RequestBody CreateIssueRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(issueService.createIssue(req));
    }

    @GetMapping
    @Operation(summary = "List campus issues with role-scoped filters")
    public ResponseEntity<List<IssueResponseDto>> listIssues(
            @RequestParam(required = false) Issue.Status status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Issue.PriorityLevel priority,
            @RequestParam(required = false) UUID locationId,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) Boolean mine) {
        return ResponseEntity.ok(issueService.listIssues(status, category, priority, locationId, departmentId, mine));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get full issue details with timeline and comments")
    public ResponseEntity<IssueResponseDto> getIssue(@PathVariable UUID id) {
        return ResponseEntity.ok(issueService.getIssue(id));
    }

    @PostMapping("/{id}/support")
    @Operation(summary = "Toggle 'I\\'m affected too' support tap")
    public ResponseEntity<Map<String, Object>> toggleSupport(@PathVariable UUID id) {
        boolean supported = issueService.toggleSupport(id);
        return ResponseEntity.ok(Map.of("supported", supported));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Advance issue status via valid state machine transition")
    public ResponseEntity<IssueResponseDto> changeStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ChangeStatusRequest req) {
        return ResponseEntity.ok(issueService.changeStatus(id, req));
    }

    @PatchMapping("/{id}/assignment")
    @Operation(summary = "Assign department or technician (Staff/Admin)")
    public ResponseEntity<IssueResponseDto> assignIssue(
            @PathVariable UUID id,
            @RequestBody AssignRequest req) {
        return ResponseEntity.ok(issueService.assignIssue(id, req));
    }

    @PatchMapping("/{id}/priority")
    @Operation(summary = "Admin override of priority with required reason")
    public ResponseEntity<IssueResponseDto> overridePriority(
            @PathVariable UUID id,
            @Valid @RequestBody OverridePriorityRequest req) {
        return ResponseEntity.ok(issueService.overridePriority(id, req));
    }

    @PostMapping("/{id}/confirm")
    @Operation(summary = "Student confirmation of resolution ('Is it fixed?') or reopen")
    public ResponseEntity<IssueResponseDto> confirmResolution(
            @PathVariable UUID id,
            @Valid @RequestBody FeedbackRequest req) {
        return ResponseEntity.ok(issueService.confirmResolution(id, req));
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Post a comment or internal staff note")
    public ResponseEntity<CommentDto> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody AddCommentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(issueService.addComment(id, req));
    }
}
