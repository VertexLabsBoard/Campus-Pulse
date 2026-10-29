package com.campuspulse.service;

import com.campuspulse.api.dto.AuthDtos.LoginRequest;
import com.campuspulse.api.dto.AuthDtos.SignupRequest;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final SecurityContextRepository securityContextRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            SecurityContextRepository securityContextRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.securityContextRepository = securityContextRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Credential-based login: validate email + password, establish session.
     * Never trusts a role supplied by the caller — the role comes from the database.
     */
    @Transactional
    public UserDto login(LoginRequest req, HttpServletRequest request, HttpServletResponse response) {
        if (req.getEmail() == null || req.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Email is required.");
        }
        if (req.getPassword() == null || req.getPassword().trim().isEmpty()) {
            throw new BadRequestException("Password is required.");
        }

        String email = req.getEmail().trim().toLowerCase();

        // Generic error message: never reveal whether an account exists
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Invalid email or password."));

        if (!user.isActive()) {
            throw new ForbiddenException("Your account has been disabled. Please contact the administrator.");
        }

        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new BadRequestException("This account has no password set. Please contact the administrator.");
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password.");
        }

        // Establish authenticated session
        establishSession(user, request, response);

        String deptName = getDepartmentName(user.getDepartmentId());
        return UserDto.from(user, deptName);
    }

    @Transactional
    public UserDto register(SignupRequest req, HttpServletRequest request, HttpServletResponse response) {
        String email = req.getEmail().trim().toLowerCase();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new BadRequestException("An account with this email address already exists.");
        }

        User user = User.builder()
                .name(req.getName().trim())
                .email(email)
                .role(req.getRole() != null ? req.getRole() : User.Role.STUDENT)
                .campus(req.getCampus() != null ? req.getCampus() : "Noida")
                .enrollmentNo(req.getEnrollmentNo())
                .course(req.getCourse())
                .batchYear(req.getBatchYear())
                .departmentId(req.getDepartmentId())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .active(true)
                .build();

        user = userRepository.save(user);

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
