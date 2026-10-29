package com.campuspulse.service;

import com.campuspulse.api.dto.AuthDtos.LoginRequest;
import com.campuspulse.api.dto.UserDto;
import com.campuspulse.domain.User;
import com.campuspulse.exception.BadRequestException;
import com.campuspulse.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DemoAuthTests {

    @Autowired private AuthService authService;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private User studentUser;
    private User staffUser;
    private User adminUser;
    private static final String STUDENT_PASSWORD = "StudentPass123!";
    private static final String STAFF_PASSWORD = "StaffPass123!";
    private static final String ADMIN_PASSWORD = "AdminPass123!";

    @BeforeEach
    void setUp() {
        studentUser = userRepository.findByEmail("demo.student@s.amity.edu")
                .orElseGet(() -> userRepository.save(User.builder()
                        .email("demo.student@s.amity.edu")
                        .name("Demo Student")
                        .role(User.Role.STUDENT)
                        .enrollmentNo("A000000001")
                        .course("B.Tech Computer Science & Engineering")
                        .batchYear("2024-2028")
                        .active(true)
                        .build()));
        studentUser.setPasswordHash(passwordEncoder.encode(STUDENT_PASSWORD));
        studentUser.setActive(true);
        studentUser = userRepository.save(studentUser);

        staffUser = userRepository.findByEmail("demo.staff@amity.edu")
                .orElseGet(() -> userRepository.save(User.builder()
                        .email("demo.staff@amity.edu")
                        .name("Demo Staff")
                        .role(User.Role.STAFF)
                        .active(true)
                        .build()));
        staffUser.setPasswordHash(passwordEncoder.encode(STAFF_PASSWORD));
        staffUser.setActive(true);
        staffUser = userRepository.save(staffUser);

        adminUser = userRepository.findByEmail("demo.admin@amity.edu")
                .orElseGet(() -> userRepository.save(User.builder()
                        .email("demo.admin@amity.edu")
                        .name("Demo Admin")
                        .role(User.Role.ADMIN)
                        .active(true)
                        .build()));
        adminUser.setPasswordHash(passwordEncoder.encode(ADMIN_PASSWORD));
        adminUser.setActive(true);
        adminUser = userRepository.save(adminUser);
    }

    @Test
    @DisplayName("Student demo account logs in with correct password")
    void testStudentLogin() {
        LoginRequest req = new LoginRequest("demo.student@s.amity.edu", STUDENT_PASSWORD);
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        UserDto user = authService.login(req, request, response);

        assertThat(user.getId()).isNotNull();
        assertThat(user.getEmail()).isEqualTo("demo.student@s.amity.edu");
        assertThat(user.getRole()).isEqualTo(User.Role.STUDENT);
        assertThat(user.getEnrollmentNo()).isEqualTo("A000000001");
    }

    @Test
    @DisplayName("Staff demo account logs in with correct password")
    void testStaffLogin() {
        LoginRequest req = new LoginRequest("demo.staff@amity.edu", STAFF_PASSWORD);
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        UserDto user = authService.login(req, request, response);

        assertThat(user.getEmail()).isEqualTo("demo.staff@amity.edu");
        assertThat(user.getRole()).isEqualTo(User.Role.STAFF);
    }

    @Test
    @DisplayName("Admin demo account logs in with correct password")
    void testAdminLogin() {
        LoginRequest req = new LoginRequest("demo.admin@amity.edu", ADMIN_PASSWORD);
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        UserDto user = authService.login(req, request, response);

        assertThat(user.getEmail()).isEqualTo("demo.admin@amity.edu");
        assertThat(user.getRole()).isEqualTo(User.Role.ADMIN);
    }

    @Test
    @DisplayName("Login with wrong password is rejected")
    void testWrongPasswordRejected() {
        LoginRequest req = new LoginRequest("demo.student@s.amity.edu", "WrongPassword!");
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        assertThatThrownBy(() -> authService.login(req, request, response))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    @DisplayName("Login with non-existent email is rejected with generic message")
    void testNonExistentEmailRejected() {
        LoginRequest req = new LoginRequest("nobody@s.amity.edu", "SomePassword!");
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        assertThatThrownBy(() -> authService.login(req, request, response))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    @DisplayName("Login as inactive user is rejected")
    void testInactiveUserRejected() {
        studentUser.setActive(false);
        userRepository.save(studentUser);

        LoginRequest req = new LoginRequest("demo.student@s.amity.edu", STUDENT_PASSWORD);
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        assertThatThrownBy(() -> authService.login(req, request, response))
                .isInstanceOf(Exception.class);
    }

    @Test
    @DisplayName("Direct registration creates user with password hash")
    void testRegisterNewStudent() {
        com.campuspulse.api.dto.AuthDtos.SignupRequest signup = new com.campuspulse.api.dto.AuthDtos.SignupRequest();
        signup.setName("Test Fresh Student");
        signup.setEmail("fresh.student@s.amity.edu");
        signup.setPassword("FreshPass2025!");
        signup.setRole(User.Role.STUDENT);
        signup.setCampus("Noida");
        signup.setEnrollmentNo("A999999999");
        signup.setCourse("B.Tech CSE");
        signup.setBatchYear("2024-2028");

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        UserDto created = authService.register(signup, request, response);

        assertThat(created.getId()).isNotNull();
        assertThat(created.getEmail()).isEqualTo("fresh.student@s.amity.edu");
        assertThat(created.getRole()).isEqualTo(User.Role.STUDENT);

        // Can log in with the newly created password
        LoginRequest req = new LoginRequest("fresh.student@s.amity.edu", "FreshPass2025!");
        UserDto loggedIn = authService.login(req, new MockHttpServletRequest(), new MockHttpServletResponse());
        assertThat(loggedIn.getId()).isEqualTo(created.getId());
    }
}
