package com.campuspulse.repository;

import com.campuspulse.domain.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class RepositoryTests {

    @Autowired private UserRepository userRepository;
    @Autowired private DepartmentRepository departmentRepository;
    @Autowired private BuildingRepository buildingRepository;
    @Autowired private LocationRepository locationRepository;
    @Autowired private AssetRepository assetRepository;
    @Autowired private IssueRepository issueRepository;
    @Autowired private IssueSupporterRepository issueSupporterRepository;
    @Autowired private IssueCommentRepository issueCommentRepository;
    @Autowired private IssueStatusHistoryRepository issueStatusHistoryRepository;
    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private SlaPolicyRepository slaPolicyRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private FeedbackRepository feedbackRepository;

    @Test
    @DisplayName("Should persist and retrieve department, building, and location with QR token")
    void testLocationHierarchy() {
        Department dept = departmentRepository.save(Department.builder()
                .name("IT Services")
                .build());
        assertThat(dept.getId()).isNotNull();

        Building building = buildingRepository.save(Building.builder()
                .name("Academic Block A")
                .code("AB-A")
                .build());
        assertThat(building.getId()).isNotNull();

        Location location = locationRepository.save(Location.builder()
                .buildingId(building.getId())
                .floor((short) 2)
                .roomCode("A-204")
                .name("Computer Lab 2")
                .qrToken("QR-LOC-A204-TEST")
                .type(Location.Type.LAB)
                .build());

        Optional<Location> found = locationRepository.findByQrToken("QR-LOC-A204-TEST");
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Computer Lab 2");
        assertThat(found.get().getFloor()).isEqualTo((short) 2);
    }

    @Test
    @DisplayName("Should persist and query users by email and role")
    void testUserPersistence() {
        User student = userRepository.save(User.builder()
                .email("student@college.edu")
                .name("Alice Smith")
                .role(User.Role.STUDENT)
                .build());

        assertThat(student.getId()).isNotNull();
        assertThat(userRepository.findByEmail("student@college.edu")).isPresent();
        assertThat(userRepository.existsByEmail("student@college.edu")).isTrue();
    }

    @Test
    @DisplayName("Should persist issue, add affected-too supporters, and comments")
    void testIssueWorkflowData() {
        User student = userRepository.save(User.builder()
                .email("reporter@college.edu")
                .name("Bob Jones")
                .role(User.Role.STUDENT)
                .build());

        Building b = buildingRepository.save(Building.builder().name("Science Block").code("SB").build());
        Location loc = locationRepository.save(Location.builder()
                .buildingId(b.getId())
                .floor((short) 1)
                .roomCode("S-101")
                .name("Physics Lab")
                .qrToken("QR-S101")
                .type(Location.Type.LAB)
                .build());

        Issue issue = issueRepository.save(Issue.builder()
                .reporterId(student.getId())
                .locationId(loc.getId())
                .category("Maintenance")
                .description("Leaking tap near sink")
                .severity((short) 3)
                .priorityScore(BigDecimal.valueOf(55.0))
                .priorityLevel(Issue.PriorityLevel.MEDIUM)
                .priorityExplanation(Map.of("score", 55, "reasons", List.of("Severity 3/5")))
                .build());

        assertThat(issue.getId()).isNotNull();
        assertThat(issue.getStatus()).isEqualTo(Issue.Status.SUBMITTED);

        // Add "I'm affected too" supporter
        User supporter = userRepository.save(User.builder()
                .email("supporter@college.edu")
                .name("Carol White")
                .role(User.Role.STUDENT)
                .build());

        issueSupporterRepository.save(IssueSupporter.builder()
                .issueId(issue.getId())
                .userId(supporter.getId())
                .build());

        assertThat(issueSupporterRepository.countByIssueId(issue.getId())).isEqualTo(1);
        assertThat(issueSupporterRepository.existsByIssueIdAndUserId(issue.getId(), supporter.getId())).isTrue();

        // Add Comment
        IssueComment comment = issueCommentRepository.save(IssueComment.builder()
                .issueId(issue.getId())
                .authorId(supporter.getId())
                .body("Still dripping water this morning")
                .internal(false)
                .build());

        assertThat(comment.getId()).isNotNull();
        List<IssueComment> comments = issueCommentRepository.findByIssueIdOrderByCreatedAtAsc(issue.getId());
        assertThat(comments).hasSize(1);
        assertThat(comments.get(0).getBody()).isEqualTo("Still dripping water this morning");

        // Status history
        issueStatusHistoryRepository.save(IssueStatusHistory.builder()
                .issueId(issue.getId())
                .fromStatus(Issue.Status.SUBMITTED)
                .toStatus(Issue.Status.VERIFIED)
                .changedBy(supporter.getId())
                .reason("Verified on site")
                .build());

        List<IssueStatusHistory> history = issueStatusHistoryRepository.findByIssueIdOrderByChangedAtAsc(issue.getId());
        assertThat(history).hasSize(1);
        assertThat(history.get(0).getToStatus()).isEqualTo(Issue.Status.VERIFIED);

        // Audit log
        AuditLog audit = auditLogRepository.save(AuditLog.builder()
                .actorId(supporter.getId())
                .action("STATUS_CHANGE")
                .entityType("ISSUE")
                .entityId(issue.getId())
                .beforeVal(Map.of("status", "SUBMITTED"))
                .afterVal(Map.of("status", "VERIFIED"))
                .build());
        assertThat(audit.getId()).isNotNull();
    }
}
