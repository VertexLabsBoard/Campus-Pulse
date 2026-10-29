package com.campuspulse.config;

import com.campuspulse.domain.*;
import com.campuspulse.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final DepartmentRepository departmentRepository;
    private final BuildingRepository buildingRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final SlaPolicyRepository slaPolicyRepository;
    private final IssueRepository issueRepository;
    private final IssueCommentRepository issueCommentRepository;
    private final IssueStatusHistoryRepository issueStatusHistoryRepository;
    private final PasswordEncoder passwordEncoder;

    // Demo account passwords from environment variables.
    // Safe defaults are provided for local development only; override in Render/production env.
    @Value("${demo.student.email:demo.student@s.amity.edu}")
    private String demoStudentEmail;

    @Value("${demo.student.password:StudentDemo2025!}")
    private String demoStudentPassword;

    @Value("${demo.staff.email:demo.staff@amity.edu}")
    private String demoStaffEmail;

    @Value("${demo.staff.password:StaffDemo2025!}")
    private String demoStaffPassword;

    @Value("${demo.admin.email:demo.admin@amity.edu}")
    private String demoAdminEmail;

    @Value("${demo.admin.password:AdminDemo2025!}")
    private String demoAdminPassword;

    public DataInitializer(
            DepartmentRepository departmentRepository,
            BuildingRepository buildingRepository,
            LocationRepository locationRepository,
            UserRepository userRepository,
            SlaPolicyRepository slaPolicyRepository,
            IssueRepository issueRepository,
            IssueCommentRepository issueCommentRepository,
            IssueStatusHistoryRepository issueStatusHistoryRepository,
            PasswordEncoder passwordEncoder) {
        this.departmentRepository = departmentRepository;
        this.buildingRepository = buildingRepository;
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
        this.slaPolicyRepository = slaPolicyRepository;
        this.issueRepository = issueRepository;
        this.issueCommentRepository = issueCommentRepository;
        this.issueStatusHistoryRepository = issueStatusHistoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Department itDept = departmentRepository.findAll().stream().filter(d -> "IT".equals(d.getName())).findFirst().orElse(null);
        Department hkDept = departmentRepository.findAll().stream().filter(d -> "Housekeeping".equals(d.getName())).findFirst().orElse(null);
        Department maintDept = departmentRepository.findAll().stream().filter(d -> "Maintenance".equals(d.getName())).findFirst().orElse(null);
        Department labDept = departmentRepository.findAll().stream().filter(d -> "Lab".equals(d.getName())).findFirst().orElse(null);
        Department elecDept = departmentRepository.findAll().stream().filter(d -> "Electrical".equals(d.getName())).findFirst().orElse(null);

        if (departmentRepository.count() == 0) {
            log.info("Seeding initial campus data (departments, building, locations, SLA policies, test users)...");

            // 1. Departments
            itDept = departmentRepository.save(Department.builder().name("IT").build());
            hkDept = departmentRepository.save(Department.builder().name("Housekeeping").build());
            maintDept = departmentRepository.save(Department.builder().name("Maintenance").build());
            labDept = departmentRepository.save(Department.builder().name("Lab").build());
            elecDept = departmentRepository.save(Department.builder().name("Electrical").build());

            // 2. Existing demo/seed users (pre-seeded with demo passwords)
            User student = userRepository.save(User.builder()
                    .email("arjun.sharma@s.amity.edu")
                    .name("Arjun Sharma")
                    .role(User.Role.STUDENT)
                    .enrollmentNo("A230522001")
                    .course("B.Tech Computer Science & Engineering")
                    .batchYear("2023-2027")
                    .passwordHash(passwordEncoder.encode(demoStudentPassword))
                    .active(true)
                    .build());

            User staffIt = userRepository.save(User.builder()
                    .email("priya.patel@amity.edu")
                    .name("Priya Patel")
                    .role(User.Role.STAFF)
                    .departmentId(itDept.getId())
                    .passwordHash(passwordEncoder.encode(demoStaffPassword))
                    .active(true)
                    .build());

            User staffMaint = userRepository.save(User.builder()
                    .email("ramesh.kumar@amity.edu")
                    .name("Ramesh Kumar")
                    .role(User.Role.STAFF)
                    .departmentId(maintDept.getId())
                    .passwordHash(passwordEncoder.encode(demoStaffPassword))
                    .active(true)
                    .build());

            User admin = userRepository.save(User.builder()
                    .email("dr.vikram.sen@amity.edu")
                    .name("Dr. Vikram Sen")
                    .role(User.Role.ADMIN)
                    .passwordHash(passwordEncoder.encode(demoAdminPassword))
                    .active(true)
                    .build());

            itDept.setHeadUserId(staffIt.getId());
            maintDept.setHeadUserId(staffMaint.getId());
            departmentRepository.saveAll(List.of(itDept, maintDept));

            // 3. Building
            Building aBlock = buildingRepository.save(Building.builder()
                    .name("A-Block")
                    .code("A")
                    .build());

            // 4. Locations
            locationRepository.saveAll(List.of(
                    Location.builder().buildingId(aBlock.getId()).floor((short) 0).roomCode("A-G01").name("Lobby").qrToken("qrt-a-g01-lobby").type(Location.Type.CORRIDOR).build(),
                    Location.builder().buildingId(aBlock.getId()).floor((short) 0).roomCode("A-G02").name("Reception").qrToken("qrt-a-g02-reception").type(Location.Type.OTHER).build(),
                    Location.builder().buildingId(aBlock.getId()).floor((short) 0).roomCode("A-G-WC").name("Ground Floor Washroom").qrToken("qrt-a-g-wc").type(Location.Type.WASHROOM).build(),
                    Location.builder().buildingId(aBlock.getId()).floor((short) 1).roomCode("A-101").name("Classroom 101").qrToken("qrt-a-101").type(Location.Type.CLASSROOM).build(),
                    Location.builder().buildingId(aBlock.getId()).floor((short) 1).roomCode("A-102").name("Classroom 102").qrToken("qrt-a-102").type(Location.Type.CLASSROOM).build(),
                    Location.builder().buildingId(aBlock.getId()).floor((short) 1).roomCode("A-103").name("Computer Lab 1").qrToken("qrt-a-103-lab").type(Location.Type.LAB).build(),
                    Location.builder().buildingId(aBlock.getId()).floor((short) 1).roomCode("A-1-WC").name("First Floor Washroom").qrToken("qrt-a-1-wc").type(Location.Type.WASHROOM).build(),
                    Location.builder().buildingId(aBlock.getId()).floor((short) 2).roomCode("A-201").name("Seminar Hall").qrToken("qrt-a-201-seminar").type(Location.Type.CLASSROOM).build(),
                    Location.builder().buildingId(aBlock.getId()).floor((short) 2).roomCode("A-202").name("Faculty Room").qrToken("qrt-a-202-faculty").type(Location.Type.OTHER).build(),
                    Location.builder().buildingId(aBlock.getId()).floor((short) 2).roomCode("A-203").name("Electronics Lab").qrToken("qrt-a-203-elab").type(Location.Type.LAB).build()
            ));

            // 5. SLA Policies
            String[] cats = {"IT", "Maintenance", "Housekeeping", "Electrical", "Lab"};
            for (String cat : cats) {
                slaPolicyRepository.save(SlaPolicy.builder().category(cat).priorityLevel(Issue.PriorityLevel.CRITICAL).respondWithinMinutes(60).resolveWithinMinutes(240).build());
                slaPolicyRepository.save(SlaPolicy.builder().category(cat).priorityLevel(Issue.PriorityLevel.HIGH).respondWithinMinutes(240).resolveWithinMinutes(1440).build());
                slaPolicyRepository.save(SlaPolicy.builder().category(cat).priorityLevel(Issue.PriorityLevel.MEDIUM).respondWithinMinutes(480).resolveWithinMinutes(4320).build());
                slaPolicyRepository.save(SlaPolicy.builder().category(cat).priorityLevel(Issue.PriorityLevel.LOW).respondWithinMinutes(1440).resolveWithinMinutes(10080).build());
            }
        }

        // ── Demo Account Provisioning (idempotent) ──────────────────────────────
        // These three accounts provide password-based login for all three roles.
        // Run on every startup but only create/update if the account is absent or has no password.
        if (itDept == null) {
            itDept = departmentRepository.findAll().stream()
                    .filter(d -> "IT".equals(d.getName())).findFirst().orElse(null);
        }
        provisionDemoAccount(
                demoStudentEmail, "Demo Student", User.Role.STUDENT,
                "A000000001", "B.Tech Computer Science & Engineering", "2024-2028", "Noida",
                null, demoStudentPassword);
        provisionDemoAccount(
                demoStaffEmail, "Demo Staff", User.Role.STAFF,
                null, null, null, null,
                itDept != null ? itDept.getId() : null, demoStaffPassword);
        provisionDemoAccount(
                demoAdminEmail, "Demo Admin", User.Role.ADMIN,
                null, null, null, null,
                null, demoAdminPassword);

        // Also ensure named test personas have valid passwords
        userRepository.findByEmail("arjun.sharma@s.amity.edu").ifPresent(u -> {
            if (u.getPasswordHash() == null || u.getPasswordHash().isBlank()) {
                u.setPasswordHash(passwordEncoder.encode(demoStudentPassword));
                userRepository.save(u);
            }
        });
        userRepository.findByEmail("priya.patel@amity.edu").ifPresent(u -> {
            if (u.getPasswordHash() == null || u.getPasswordHash().isBlank()) {
                u.setPasswordHash(passwordEncoder.encode(demoStaffPassword));
                userRepository.save(u);
            }
        });
        userRepository.findByEmail("ramesh.kumar@amity.edu").ifPresent(u -> {
            if (u.getPasswordHash() == null || u.getPasswordHash().isBlank()) {
                u.setPasswordHash(passwordEncoder.encode(demoStaffPassword));
                userRepository.save(u);
            }
        });
        userRepository.findByEmail("dr.vikram.sen@amity.edu").ifPresent(u -> {
            if (u.getPasswordHash() == null || u.getPasswordHash().isBlank()) {
                u.setPasswordHash(passwordEncoder.encode(demoAdminPassword));
                userRepository.save(u);
            }
        });

        // Seed realistic sample issues if none exist
        if (issueRepository.count() == 0) {
            log.info("Seeding realistic sample issues for campus feed...");
            User student = userRepository.findByEmail("arjun.sharma@s.amity.edu")
                    .or(() -> userRepository.findByEmail(demoStudentEmail))
                    .orElse(null);
            User staffMaint = userRepository.findByEmail("ramesh.kumar@amity.edu").orElse(null);
            User staffIt = userRepository.findByEmail("priya.patel@amity.edu").orElse(null);
            Location lab103 = locationRepository.findByQrToken("qrt-a-103-lab").orElse(null);
            Location lobby = locationRepository.findByQrToken("qrt-a-g01-lobby").orElse(null);
            Location seminar = locationRepository.findByQrToken("qrt-a-201-seminar").orElse(null);
            Location washroom = locationRepository.findByQrToken("qrt-a-1-wc").orElse(null);

            final Department finalItDept = itDept;
            final Department finalMaintDept = departmentRepository.findAll().stream()
                    .filter(d -> "Maintenance".equals(d.getName())).findFirst().orElse(null);
            final Department finalHkDept = departmentRepository.findAll().stream()
                    .filter(d -> "Housekeeping".equals(d.getName())).findFirst().orElse(null);
            final Department finalElecDept = departmentRepository.findAll().stream()
                    .filter(d -> "Electrical".equals(d.getName())).findFirst().orElse(null);

            if (student != null && lab103 != null && lobby != null) {
                // Issue 1: Critical Maintenance leak
                Issue issue1 = issueRepository.save(Issue.builder()
                        .ticketNo("CP-1001")
                        .reporterId(student.getId())
                        .locationId(lobby.getId())
                        .category("Maintenance")
                        .description("Water dispenser drain overflowing onto main corridor tiles creating slip hazard")
                        .severity((short) 4)
                        .safetyFlag(true)
                        .status(Issue.Status.IN_PROGRESS)
                        .departmentId(finalMaintDept != null ? finalMaintDept.getId() : null)
                        .assigneeId(staffMaint != null ? staffMaint.getId() : null)
                        .priorityScore(java.math.BigDecimal.valueOf(88.0))
                        .priorityLevel(Issue.PriorityLevel.CRITICAL)
                        .priorityExplanation(java.util.Map.of(
                                "score", 88,
                                "level", "CRITICAL",
                                "reasons", List.of(
                                        "+28 Severity: 4/5 (Water slip hazard)",
                                        "+50 Safety Override: Slip hazard in high-traffic corridor",
                                        "+10 Corridor Location: High student footfall"
                                )
                        ))
                        .build());
                if (staffMaint != null) {
                    issueCommentRepository.save(IssueComment.builder()
                            .issueId(issue1.getId())
                            .authorId(staffMaint.getId())
                            .body("Caution wet floor signage placed. Shutoff valve inspected, replacing washer.")
                            .internal(false)
                            .build());
                }

                // Issue 2: Medium IT projector issue
                Issue issue2 = issueRepository.save(Issue.builder()
                        .ticketNo("CP-1002")
                        .reporterId(student.getId())
                        .locationId(lab103.getId())
                        .category("IT")
                        .description("Projector color distorted (green tint) and cooling fan making high-pitched noise")
                        .severity((short) 3)
                        .safetyFlag(false)
                        .status(Issue.Status.VERIFIED)
                        .departmentId(finalItDept != null ? finalItDept.getId() : null)
                        .priorityScore(java.math.BigDecimal.valueOf(45.0))
                        .priorityLevel(Issue.PriorityLevel.MEDIUM)
                        .priorityExplanation(java.util.Map.of(
                                "score", 45,
                                "level", "MEDIUM",
                                "reasons", List.of(
                                        "+21 Severity: 3/5 (Lab equipment issue)",
                                        "+15 Academic Lab: Used for CS practical sessions",
                                        "+9 Age: Reported 4 hours ago"
                                )
                        ))
                        .build());
                if (staffIt != null) {
                    issueCommentRepository.save(IssueComment.builder()
                            .issueId(issue2.getId())
                            .authorId(staffIt.getId())
                            .body("Verified optical cable. Replacement lamp module scheduled for 4 PM.")
                            .internal(false)
                            .build());
                }

                // Issue 3: Resolved Electrical issue
                if (seminar != null) {
                    Issue issue3 = issueRepository.save(Issue.builder()
                            .ticketNo("CP-1003")
                            .reporterId(student.getId())
                            .locationId(seminar.getId())
                            .category("Electrical")
                            .description("Podium microphone socket buzzing loudly when audio mixer is powered")
                            .severity((short) 3)
                            .safetyFlag(false)
                            .status(Issue.Status.RESOLVED)
                            .departmentId(finalElecDept != null ? finalElecDept.getId() : null)
                            .priorityScore(java.math.BigDecimal.valueOf(52.0))
                            .priorityLevel(Issue.PriorityLevel.MEDIUM)
                            .resolvedAt(java.time.Instant.now().minusSeconds(1800))
                            .priorityExplanation(java.util.Map.of(
                                    "score", 52,
                                    "level", "MEDIUM",
                                    "reasons", List.of(
                                            "+21 Severity: 3/5 (Audio system grounded)",
                                            "+20 Seminar Venue: Upcoming department guest lecture",
                                            "+11 Quick response SLA target met"
                                    )
                            ))
                            .build());
                    if (staffIt != null) {
                        issueCommentRepository.save(IssueComment.builder()
                                .issueId(issue3.getId())
                                .authorId(staffIt.getId())
                                .body("Ground loop isolator installed on podium XLR interface. Clean audio confirmed.")
                                .internal(false)
                                .build());
                    }
                }

                // Issue 4: Submitted Housekeeping issue
                if (washroom != null) {
                    issueRepository.save(Issue.builder()
                            .ticketNo("CP-1004")
                            .reporterId(student.getId())
                            .locationId(washroom.getId())
                            .category("Housekeeping")
                            .description("Soap dispenser empty and paper towel rack jammed near entrance")
                            .severity((short) 2)
                            .safetyFlag(false)
                            .status(Issue.Status.SUBMITTED)
                            .departmentId(finalHkDept != null ? finalHkDept.getId() : null)
                            .priorityScore(java.math.BigDecimal.valueOf(25.0))
                            .priorityLevel(Issue.PriorityLevel.LOW)
                            .priorityExplanation(java.util.Map.of(
                                    "score", 25,
                                    "level", "LOW",
                                    "reasons", List.of(
                                            "+14 Severity: 2/5 (Hygiene refill request)",
                                            "+11 Routine service policy window active"
                                    )
                            ))
                            .build());
                }
            }
        }

        log.info("Campus Pulse data initialization completed.");
    }

    /**
     * Idempotent: creates the demo account if it does not exist,
     * or sets/updates its password hash if it was previously created without one.
     * Never overwrites an existing password or demotes an existing role.
     */
    private void provisionDemoAccount(
            String email, String name, User.Role role,
            String enrollmentNo, String course, String batchYear, String campus,
            UUID departmentId, String rawPassword) {

        userRepository.findByEmail(email).ifPresentOrElse(
                existing -> {
                    // Only update password hash if the account has no password yet
                    if (existing.getPasswordHash() == null || existing.getPasswordHash().isBlank()) {
                        existing.setPasswordHash(passwordEncoder.encode(rawPassword));
                        userRepository.save(existing);
                        log.info("Updated password hash for existing demo account: {}", email);
                    }
                    // Log a reminder if the account is inactive
                    if (!existing.isActive()) {
                        log.warn("Demo account {} is inactive — login will be rejected until re-activated.", email);
                    }
                },
                () -> {
                    User user = User.builder()
                            .email(email)
                            .name(name)
                            .role(role)
                            .enrollmentNo(enrollmentNo)
                            .course(course)
                            .batchYear(batchYear)
                            .campus(campus)
                            .departmentId(departmentId)
                            .active(true)
                            .passwordHash(passwordEncoder.encode(rawPassword))
                            .build();
                    userRepository.save(user);
                    log.info("Provisioned demo account: {} ({})", email, role);
                }
        );
    }
}
