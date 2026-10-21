package com.campuspulse.service;

import com.campuspulse.api.dto.AuthDtos.*;
import com.campuspulse.api.dto.UserDto;
import com.campuspulse.domain.User;
import com.campuspulse.exception.BadRequestException;
import com.campuspulse.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AmityAuthTests {

    @Autowired private AuthService authService;
    @Autowired private OtpService otpService;
    @Autowired private UserRepository userRepository;

    @Test
    @DisplayName("Should successfully send OTP and register Amity Student with valid @s.amity.edu and enrollment starting with 'A'")
    void testAmityStudentRegistrationSuccess() {
        SignupSendOtpRequest sendReq = new SignupSendOtpRequest();
        sendReq.setRole(User.Role.STUDENT);
        sendReq.setName("Rohit Varma");
        sendReq.setEmail("rohit.varma@s.amity.edu");
        sendReq.setEnrollmentNo("A230522401");
        sendReq.setCourse("B.Tech Computer Science & Engineering");
        sendReq.setBatchYear("2024-2028");

        OtpResponse otpResp = authService.signupSendOtp(sendReq);
        assertThat(otpResp.getDevOtp()).isNotNull().hasSize(6);

        // Verify and complete signup
        SignupVerifyRequest verifyReq = new SignupVerifyRequest();
        verifyReq.setRole(User.Role.STUDENT);
        verifyReq.setName("Rohit Varma");
        verifyReq.setEmail("rohit.varma@s.amity.edu");
        verifyReq.setEnrollmentNo("A230522401");
        verifyReq.setCourse("B.Tech Computer Science & Engineering");
        verifyReq.setBatchYear("2024-2028");
        verifyReq.setOtp(otpResp.getDevOtp());

        MockHttpServletRequest req = new MockHttpServletRequest();
        MockHttpServletResponse res = new MockHttpServletResponse();

        UserDto user = authService.signupVerify(verifyReq, req, res);
        assertThat(user.getId()).isNotNull();
        assertThat(user.getEmail()).isEqualTo("rohit.varma@s.amity.edu");
        assertThat(user.getRole()).isEqualTo(User.Role.STUDENT);
        assertThat(user.getEnrollmentNo()).isEqualTo("A230522401");
        assertThat(user.getCourse()).isEqualTo("B.Tech Computer Science & Engineering");
        assertThat(user.getBatchYear()).isEqualTo("2024-2028");
    }

    @Test
    @DisplayName("Should reject Student registering with staff email @amity.edu")
    void testStudentWithStaffEmailRejected() {
        SignupSendOtpRequest sendReq = new SignupSendOtpRequest();
        sendReq.setRole(User.Role.STUDENT);
        sendReq.setName("Invalid Student");
        sendReq.setEmail("invalid@amity.edu"); // Staff domain
        sendReq.setEnrollmentNo("A230522402");
        sendReq.setCourse("BCA");
        sendReq.setBatchYear("2024-2027");

        assertThatThrownBy(() -> authService.signupSendOtp(sendReq))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Staff email (@amity.edu) cannot be used for student registration");
    }

    @Test
    @DisplayName("Should reject Staff registering with student email @s.amity.edu")
    void testStaffWithStudentEmailRejected() {
        SignupSendOtpRequest sendReq = new SignupSendOtpRequest();
        sendReq.setRole(User.Role.STAFF);
        sendReq.setName("Invalid Staff");
        sendReq.setEmail("staff@s.amity.edu"); // Student domain

        assertThatThrownBy(() -> authService.signupSendOtp(sendReq))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Student email (@s.amity.edu) cannot be used for staff registration");
    }

    @Test
    @DisplayName("Should reject non-Amity emails like @gmail.com to prevent botting")
    void testNonAmityEmailRejected() {
        SignupSendOtpRequest sendReq = new SignupSendOtpRequest();
        sendReq.setRole(User.Role.STUDENT);
        sendReq.setName("External Bot");
        sendReq.setEmail("bot@gmail.com");
        sendReq.setEnrollmentNo("A230522403");

        assertThatThrownBy(() -> authService.signupSendOtp(sendReq))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Only official Amity University student emails");
    }

    @Test
    @DisplayName("Should reject student enrollment numbers that do NOT start with 'A'")
    void testEnrollmentNotStartingWithARejected() {
        SignupSendOtpRequest sendReq = new SignupSendOtpRequest();
        sendReq.setRole(User.Role.STUDENT);
        sendReq.setName("Student X");
        sendReq.setEmail("student.x@s.amity.edu");
        sendReq.setEnrollmentNo("99230522404"); // Doesn't start with A
        sendReq.setCourse("BBA");
        sendReq.setBatchYear("2024-2027");

        assertThatThrownBy(() -> authService.signupSendOtp(sendReq))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("must start with the letter 'A'");
    }

    @Test
    @DisplayName("Should verify passwordless login with OTP for existing Amity account")
    void testAmityLoginWithOtp() {
        // Create user
        userRepository.save(User.builder()
                .name("Kavita Rao")
                .email("kavita.rao@s.amity.edu")
                .role(User.Role.STUDENT)
                .enrollmentNo("A9901122")
                .course("MBA")
                .batchYear("2024-2026")
                .active(true)
                .build());

        // Request login OTP
        LoginSendOtpRequest loginReq = new LoginSendOtpRequest("kavita.rao@s.amity.edu");
        OtpResponse otpResp = authService.loginSendOtp(loginReq);
        assertThat(otpResp.getDevOtp()).isNotNull();

        // Verify with wrong OTP fails
        LoginVerifyRequest wrongVerify = new LoginVerifyRequest("kavita.rao@s.amity.edu", "000000");
        MockHttpServletRequest req = new MockHttpServletRequest();
        MockHttpServletResponse res = new MockHttpServletResponse();
        assertThatThrownBy(() -> authService.loginVerify(wrongVerify, req, res))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid OTP");

        // Verify with correct OTP succeeds
        LoginVerifyRequest correctVerify = new LoginVerifyRequest("kavita.rao@s.amity.edu", otpResp.getDevOtp());
        UserDto user = authService.loginVerify(correctVerify, req, res);
        assertThat(user.getName()).isEqualTo("Kavita Rao");
        assertThat(user.getEmail()).isEqualTo("kavita.rao@s.amity.edu");
    }
}
