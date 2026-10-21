package com.campuspulse.api;

import com.campuspulse.api.dto.UserDto;
import com.campuspulse.domain.Department;
import com.campuspulse.domain.Issue;
import com.campuspulse.domain.User;
import com.campuspulse.repository.DepartmentRepository;
import com.campuspulse.repository.IssueRepository;
import com.campuspulse.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Admin Console", description = "Administration, metrics, and user management")
public class AdminController {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    public AdminController(IssueRepository issueRepository, UserRepository userRepository, DepartmentRepository departmentRepository) {
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
    }

    public static class MetricsSummaryDto {
        private long totalIssues;
        private long openIssues;
        private long inProgressIssues;
        private long resolvedIssues;
        private long criticalIssues;
        private Map<String, Long> issuesByDepartment;
        private Map<String, Long> issuesByCategory;

        public MetricsSummaryDto() {}

        public MetricsSummaryDto(long totalIssues, long openIssues, long inProgressIssues, long resolvedIssues, long criticalIssues, Map<String, Long> issuesByDepartment, Map<String, Long> issuesByCategory) {
            this.totalIssues = totalIssues;
            this.openIssues = openIssues;
            this.inProgressIssues = inProgressIssues;
            this.resolvedIssues = resolvedIssues;
            this.criticalIssues = criticalIssues;
            this.issuesByDepartment = issuesByDepartment;
            this.issuesByCategory = issuesByCategory;
        }

        public long getTotalIssues() { return totalIssues; }
        public void setTotalIssues(long totalIssues) { this.totalIssues = totalIssues; }

        public long getOpenIssues() { return openIssues; }
        public void setOpenIssues(long openIssues) { this.openIssues = openIssues; }

        public long getInProgressIssues() { return inProgressIssues; }
        public void setInProgressIssues(long inProgressIssues) { this.inProgressIssues = inProgressIssues; }

        public long getResolvedIssues() { return resolvedIssues; }
        public void setResolvedIssues(long resolvedIssues) { this.resolvedIssues = resolvedIssues; }

        public long getCriticalIssues() { return criticalIssues; }
        public void setCriticalIssues(long criticalIssues) { this.criticalIssues = criticalIssues; }

        public Map<String, Long> getIssuesByDepartment() { return issuesByDepartment; }
        public void setIssuesByDepartment(Map<String, Long> issuesByDepartment) { this.issuesByDepartment = issuesByDepartment; }

        public Map<String, Long> getIssuesByCategory() { return issuesByCategory; }
        public void setIssuesByCategory(Map<String, Long> issuesByCategory) { this.issuesByCategory = issuesByCategory; }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private long totalIssues;
            private long openIssues;
            private long inProgressIssues;
            private long resolvedIssues;
            private long criticalIssues;
            private Map<String, Long> issuesByDepartment;
            private Map<String, Long> issuesByCategory;

            public Builder totalIssues(long totalIssues) { this.totalIssues = totalIssues; return this; }
            public Builder openIssues(long openIssues) { this.openIssues = openIssues; return this; }
            public Builder inProgressIssues(long inProgressIssues) { this.inProgressIssues = inProgressIssues; return this; }
            public Builder resolvedIssues(long resolvedIssues) { this.resolvedIssues = resolvedIssues; return this; }
            public Builder criticalIssues(long criticalIssues) { this.criticalIssues = criticalIssues; return this; }
            public Builder issuesByDepartment(Map<String, Long> issuesByDepartment) { this.issuesByDepartment = issuesByDepartment; return this; }
            public Builder issuesByCategory(Map<String, Long> issuesByCategory) { this.issuesByCategory = issuesByCategory; return this; }

            public MetricsSummaryDto build() {
                return new MetricsSummaryDto(totalIssues, openIssues, inProgressIssues, resolvedIssues, criticalIssues, issuesByDepartment, issuesByCategory);
            }
        }
    }

    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        return ResponseEntity.ok(Map.of("status", "ok", "service", "admin-console"));
    }

    @GetMapping("/metrics/summary")
    @Operation(summary = "Get high-level operational metrics and breakdown")
    public ResponseEntity<MetricsSummaryDto> getMetricsSummary() {
        List<Issue> all = issueRepository.findAll();

        long open = all.stream().filter(i -> i.getStatus() == Issue.Status.SUBMITTED || i.getStatus() == Issue.Status.VERIFIED || i.getStatus() == Issue.Status.ASSIGNED).count();
        long inProgress = all.stream().filter(i -> i.getStatus() == Issue.Status.IN_PROGRESS).count();
        long resolved = all.stream().filter(i -> i.getStatus() == Issue.Status.RESOLVED || i.getStatus() == Issue.Status.CLOSED).count();
        long critical = all.stream().filter(i -> i.getPriorityLevel() == Issue.PriorityLevel.CRITICAL).count();

        Map<String, Long> byDept = new HashMap<>();
        Map<String, Long> byCat = new HashMap<>();

        for (Issue issue : all) {
            String cat = issue.getCategory();
            byCat.put(cat, byCat.getOrDefault(cat, 0L) + 1);

            if (issue.getDepartmentId() != null) {
                String dName = departmentRepository.findById(issue.getDepartmentId())
                        .map(Department::getName)
                        .orElse("Other");
                byDept.put(dName, byDept.getOrDefault(dName, 0L) + 1);
            }
        }

        return ResponseEntity.ok(MetricsSummaryDto.builder()
                .totalIssues(all.size())
                .openIssues(open)
                .inProgressIssues(inProgress)
                .resolvedIssues(resolved)
                .criticalIssues(critical)
                .issuesByDepartment(byDept)
                .issuesByCategory(byCat)
                .build());
    }

    @GetMapping("/users")
    @Operation(summary = "List staff and admin users for assignment")
    public ResponseEntity<List<UserDto>> getStaffUsers() {
        List<User> staff = userRepository.findAll().stream()
                .filter(u -> u.getRole() != User.Role.STUDENT)
                .toList();

        List<UserDto> dtos = staff.stream().map(u -> {
            String deptName = u.getDepartmentId() != null
                    ? departmentRepository.findById(u.getDepartmentId()).map(Department::getName).orElse(null)
                    : null;
            return UserDto.from(u, deptName);
        }).toList();

        return ResponseEntity.ok(dtos);
    }
}
