package com.campuspulse.api;

import com.campuspulse.api.dto.IssueDtos.IssueResponseDto;
import com.campuspulse.security.UserPrincipal;
import com.campuspulse.service.AuthService;
import com.campuspulse.service.IssueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/staff")
@Tag(name = "Staff Queue", description = "Endpoints for technicians and department staff")
public class StaffController {

    private final IssueService issueService;
    private final AuthService authService;

    public StaffController(IssueService issueService, AuthService authService) {
        this.issueService = issueService;
        this.authService = authService;
    }

    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        return ResponseEntity.ok(Map.of("status", "ok", "service", "staff-queue"));
    }

    @GetMapping("/my-jobs")
    @Operation(summary = "Get jobs assigned to current staff member or department queue")
    public ResponseEntity<List<IssueResponseDto>> getMyJobs() {
        UserPrincipal principal = authService.getCurrentPrincipal();
        // Return issues for staff's department
        List<IssueResponseDto> departmentJobs = issueService.listIssues(
                null, null, null, null, principal.getDepartmentId(), false);
        return ResponseEntity.ok(departmentJobs);
    }
}
