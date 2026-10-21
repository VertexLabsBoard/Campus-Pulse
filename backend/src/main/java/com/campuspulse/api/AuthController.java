package com.campuspulse.api;

import com.campuspulse.api.dto.AuthDtos.*;
import com.campuspulse.api.dto.DevLoginRequest;
import com.campuspulse.api.dto.UserDto;
import com.campuspulse.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Authentication and session management endpoints")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get currently authenticated user profile")
    public ResponseEntity<UserDto> getMe() {
        return ResponseEntity.ok(authService.getCurrentUserDto());
    }

    @PostMapping("/signup/send-otp")
    @Operation(summary = "Generate and send 6-digit OTP for Amity University registration")
    public ResponseEntity<OtpResponse> signupSendOtp(@Valid @RequestBody SignupSendOtpRequest request) {
        return ResponseEntity.ok(authService.signupSendOtp(request));
    }

    @PostMapping("/signup/verify")
    @Operation(summary = "Verify OTP and complete Amity user registration")
    public ResponseEntity<UserDto> signupVerify(
            @Valid @RequestBody SignupVerifyRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        return ResponseEntity.ok(authService.signupVerify(request, httpRequest, httpResponse));
    }

    @PostMapping("/login/send-otp")
    @Operation(summary = "Send OTP for passwordless login with Amity email")
    public ResponseEntity<OtpResponse> loginSendOtp(@Valid @RequestBody LoginSendOtpRequest request) {
        return ResponseEntity.ok(authService.loginSendOtp(request));
    }

    @PostMapping("/login/verify")
    @Operation(summary = "Verify OTP and log in with Amity email")
    public ResponseEntity<UserDto> loginVerify(
            @Valid @RequestBody LoginVerifyRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        return ResponseEntity.ok(authService.loginVerify(request, httpRequest, httpResponse));
    }

    @PostMapping("/dev-login")
    @Operation(summary = "Dev-only local login (disabled in production profile)")
    public ResponseEntity<UserDto> devLogin(
            @Valid @RequestBody DevLoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        UserDto user = authService.devLogin(request.getEmail(), httpRequest, httpResponse);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/logout")
    @Operation(summary = "Log out and invalidate current session")
    public ResponseEntity<Map<String, String>> logout(
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        authService.logout(httpRequest, httpResponse);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
