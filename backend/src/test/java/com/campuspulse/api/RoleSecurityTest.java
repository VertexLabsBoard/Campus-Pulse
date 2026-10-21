package com.campuspulse.api;

import com.campuspulse.api.dto.DevLoginRequest;
import com.campuspulse.domain.User;
import com.campuspulse.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RoleSecurityTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        userRepository.save(User.builder()
                .email("student@college.edu")
                .name("Arjun Sharma")
                .role(User.Role.STUDENT)
                .active(true)
                .build());

        userRepository.save(User.builder()
                .email("staff@college.edu")
                .name("Priya Patel")
                .role(User.Role.STAFF)
                .active(true)
                .build());

        userRepository.save(User.builder()
                .email("admin@college.edu")
                .name("Dr. Vikram Sen")
                .role(User.Role.ADMIN)
                .active(true)
                .build());
    }

    @Test
    @DisplayName("Unauthenticated request to /auth/me returns 401 with JSON error")
    void unauthenticatedReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("Dev login as student sets session and returns profile")
    void devLoginSetsSession() throws Exception {
        DevLoginRequest loginReq = new DevLoginRequest("student@college.edu");

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/dev-login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("student@college.edu"))
                .andExpect(jsonPath("$.role").value("STUDENT"))
                .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);
        assertThat(session).isNotNull();

        // Use same session to call /auth/me
        mockMvc.perform(get("/api/v1/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("student@college.edu"))
                .andExpect(jsonPath("$.name").value("Arjun Sharma"))
                .andExpect(jsonPath("$.role").value("STUDENT"));
    }

    @Test
    @DisplayName("STUDENT role is forbidden from staff endpoints")
    @WithMockUser(roles = "STUDENT")
    void studentCannotAccessStaffEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/staff/ping"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("STAFF role can access staff endpoints")
    @WithMockUser(roles = "STAFF")
    void staffCanAccessStaffEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/staff/ping"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.service").value("staff-queue"));
    }

    @Test
    @DisplayName("STAFF role is forbidden from admin endpoints")
    @WithMockUser(roles = "STAFF")
    void staffCannotAccessAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/admin/ping"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("ADMIN role can access admin endpoints and staff endpoints")
    @WithMockUser(roles = "ADMIN")
    void adminCanAccessAdminAndStaff() throws Exception {
        mockMvc.perform(get("/api/v1/admin/ping"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.service").value("admin-console"));

        mockMvc.perform(get("/api/v1/staff/ping"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Logout clears session")
    void logoutClearsSession() throws Exception {
        DevLoginRequest loginReq = new DevLoginRequest("student@college.edu");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/dev-login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);

        mockMvc.perform(post("/api/v1/auth/logout").session(session))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/auth/me").session(session))
                .andExpect(status().isUnauthorized());
    }
}
