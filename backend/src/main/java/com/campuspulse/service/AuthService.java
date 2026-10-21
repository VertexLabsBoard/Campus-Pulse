package com.campuspulse.service;

import com.campuspulse.api.dto.AuthDtos.*;
import com.campuspulse.api.dto.UserDto;
import com.campuspulse.domain.Department;
import com.campuspulse.domain.User;
import com.campuspulse.exception.BadRequestException;
import com.campuspulse.exception.ForbiddenException;
import com.campuspulse.exception.UnauthorizedException;
import com.campuspulse.repository.DepartmentRepository;
import com.campuspulse.repository.UserRepository;
import com.campuspulse.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final Environment environment;
    private final SecurityContextRepository securityContextRepository;
    private final OtpService otpService;

    public AuthService(
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            Environment environment,
            SecurityContextRepository securityContextRepository,
            OtpService otpService) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.environment = environment;
        this.securityContextRepository = securityContextRepository;
        this.otpService = otpService;
    }

    /**
     * Strictly validate Amity University email domain based on persona role.
     * Students MUST end with @s.amity.edu
     * Staff/Faculty MUST end with @amity.edu (and not @s.amity.edu)
     */
    public void validateAmityEmail(User.Role role, String rawEmail) {
        if (rawEmail == null || rawEmail.trim().isEmpty()) {
            throw new BadRequestException("Email address is required.");
        }
        String email = rawEmail.trim().toLowerCase();

        if (role == User.Role.STUDENT) {
            if (email.endsWith("@amity.edu") && !email.endsWith("@s.amity.edu")) {
                throw new BadRequestException("Staff email (@amity.edu) cannot be used for student registration. Please use your student email ending with @s.amity.edu.");
            }
            if (!email.endsWith("@s.amity.edu")) {
                throw new BadRequestException("Only official Amity University student emails ending with @s.amity.edu are permitted.");
            }
        } else if (role == User.Role.STAFF || role == User.Role.ADMIN) {
            if (email.endsWith("@s.amity.edu")) {
                throw new BadRequestException("Student email (@s.amity.edu) cannot be used for staff registration. Please use your faculty/staff email ending with @amity.edu.");
            }
            if (!email.endsWith("@amity.edu")) {
                throw new BadRequestException("Only official Amity University staff/faculty emails ending with @amity.edu are permitted.");
            }
        }
    }

    /**
     * Validate Amity enrollment number (must start with letter 'A')
     */
    public String validateEnrollmentNo(String rawEnrollmentNo) {
        if (rawEnrollmentNo == null || rawEnrollmentNo.trim().isEmpty()) {
            throw new BadRequestException("Enrollment number is required for students.");
        }
        String clean = rawEnrollmentNo.trim().toUpperCase();
        if (!clean.startsWith("A")) {
            throw new BadRequestException("Amity enrollment number must start with the letter 'A' (e.g., A2305220001).");
        }
        if (clean.length() < 4) {
            throw new BadRequestException("Enrollment number is too short. Please enter a valid Amity enrollment number.");
        }
        return clean;
    }

    @Transactional
    public OtpResponse signupSendOtp(SignupSendOtpRequest req) {
        validateAmityEmail(req.getRole(), req.getEmail());
        String email = req.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with Amity email '" + email + "' already exists. Please sign in instead.");
        }

        if (req.getRole() == User.Role.STUDENT) {
            validateEnrollmentNo(req.getEnrollmentNo());
            if (req.getCourse() == null || req.getCourse().trim().isEmpty()) {
                throw new BadRequestException("Course of study is required for student registration.");
            }
            if (req.getBatchYear() == null || req.getBatchYear().trim().isEmpty()) {
                throw new BadRequestException("Course batch year (e.g. 2024-2028) is required for student registration.");
            }
        }

        String otp = otpService.generateOtp(email, "SIGNUP");
        return new OtpResponse(
                "Verification code sent to " + email + ". Valid for 10 minutes.",
                email,
                otp,
                600
        );
    }

    @Transactional
    public UserDto signupVerify(SignupVerifyRequest req, HttpServletRequest request, HttpServletResponse response) {
        validateAmityEmail(req.getRole(), req.getEmail());
        String email = req.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with Amity email '" + email + "' already exists.");
        }

        String enrollmentNo = null;
        String course = null;
        String batchYear = null;

        if (req.getRole() == User.Role.STUDENT) {
            enrollmentNo = validateEnrollmentNo(req.getEnrollmentNo());
            if (req.getCourse() == null || req.getCourse().trim().isEmpty()) {
                throw new BadRequestException("Course of study is required.");
            }
            course = req.getCourse().trim();
            if (req.getBatchYear() == null || req.getBatchYear().trim().isEmpty()) {
                throw new BadRequestException("Course batch year is required.");
            }
            batchYear = req.getBatchYear().trim();
        }

        // Verify OTP
        otpService.verifyOtp(email, "SIGNUP", req.getOtp());

        // Create user entity
        User user = User.builder()
                .email(email)
                .name(req.getName().trim())
                .role(req.getRole())
                .enrollmentNo(enrollmentNo)
                .course(course)
                .batchYear(batchYear)
                .campus(req.getCampus() != null ? req.getCampus().trim() : null)
                .departmentId(req.getRole() == User.Role.STAFF ? req.getDepartmentId() : null)
                .active(true)
                .build();

        user = userRepository.save(user);

        // Establish authenticated session
        establishSession(user, request, response);

        String deptName = getDepartmentName(user.getDepartmentId());
        return UserDto.from(user, deptName);
    }

    @Transactional(readOnly = true)
    public OtpResponse loginSendOtp(LoginSendOtpRequest req) {
        if (req.getEmail() == null || req.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Amity email is required.");
        }
        String email = req.getEmail().trim().toLowerCase();

        if (!email.endsWith("@s.amity.edu") && !email.endsWith("@amity.edu")) {
            throw new BadRequestException("Only Amity University email addresses (@s.amity.edu or @amity.edu) are eligible to sign in.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("No registered account found for '" + email + "'. Please sign up first."));

        if (!user.isActive()) {
            throw new ForbiddenException("Your Amity account has been disabled. Please contact the administrator.");
        }

        String otp = otpService.generateOtp(email, "LOGIN");
        return new OtpResponse(
                "Sign-in verification code sent to " + email + ". Valid for 10 minutes.",
                email,
                otp,
                600
        );
    }

    @Transactional
    public UserDto loginVerify(LoginVerifyRequest req, HttpServletRequest request, HttpServletResponse response) {
        if (req.getEmail() == null || req.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Amity email is required.");
        }
        String email = req.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("No registered account found for '" + email + "'."));

        if (!user.isActive()) {
            throw new ForbiddenException("Account is disabled.");
        }

        otpService.verifyOtp(email, "LOGIN", req.getOtp());

        // Establish authenticated session
        establishSession(user, request, response);

        String deptName = getDepartmentName(user.getDepartmentId());
        return UserDto.from(user, deptName);
    }

    private void establishSession(User user, HttpServletRequest request, HttpServletResponse response) {
        UserPrincipal principal = new UserPrincipal(user);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);
    }

    private String getDepartmentName(UUID deptId) {
        if (deptId == null) return null;
        return departmentRepository.findById(deptId).map(Department::getName).orElse(null);
    }

    @Transactional
    public UserDto devLogin(String email, HttpServletRequest request, HttpServletResponse response) {
        if (environment.acceptsProfiles(Profiles.of("prod"))) {
            throw new ForbiddenException("Dev login is disabled in production");
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            String roleName = email.contains("admin") ? "ADMIN" :
                             (email.contains("staff") ? "STAFF" : "STUDENT");
            User.Role role = User.Role.valueOf(roleName);
            String name = email.split("@")[0].replace(".", " ");
            name = Character.toUpperCase(name.charAt(0)) + name.substring(1);

            return userRepository.save(User.builder()
                    .email(email)
                    .name(name)
                    .role(role)
                    .enrollmentNo(role == User.Role.STUDENT ? "A230522001" : null)
                    .course(role == User.Role.STUDENT ? "B.Tech Computer Science & Engineering" : null)
                    .batchYear(role == User.Role.STUDENT ? "2023-2027" : null)
                    .active(true)
                    .build());
        });

        if (!user.isActive()) {
            throw new ForbiddenException("User account is disabled");
        }

        establishSession(user, request, response);

        String deptName = getDepartmentName(user.getDepartmentId());
        return UserDto.from(user, deptName);
    }

    public UserPrincipal getCurrentPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new UnauthorizedException("You must be signed in to perform this action");
        }
        return principal;
    }

    public Optional<UserPrincipal> getOptionalPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof UserPrincipal principal) {
            return Optional.of(principal);
        }
        return Optional.empty();
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUserDto() {
        UserPrincipal principal = getCurrentPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        String deptName = getDepartmentName(user.getDepartmentId());
        return UserDto.from(user, deptName);
    }

    public void logout(HttpServletRequest request, HttpServletResponse response) {
        SecurityContextHolder.clearContext();
        if (request.getSession(false) != null) {
            request.getSession(false).invalidate();
        }
    }
}
