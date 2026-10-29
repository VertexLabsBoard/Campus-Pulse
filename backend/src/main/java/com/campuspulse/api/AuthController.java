package com.campuspulse.api;

import com.campuspulse.api.dto.AuthDtos.LoginRequest;
import com.campuspulse.api.dto.AuthDtos.SignupRequest;
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

    @PostMapping("/login")
    @Operation(summary = "Credential-based login with email and password")
    public ResponseEntity<UserDto> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        UserDto user = authService.login(request, httpRequest, httpResponse);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/signup")
    @Operation(summary = "Direct demo registration with institutional profile and password")
    public ResponseEntity<UserDto> signup(
            @Valid @RequestBody SignupRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        UserDto user = authService.register(request, httpRequest, httpResponse);
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
