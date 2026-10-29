package com.campuspulse.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AuthDtos {

    /**
     * Demo / credential-based login request: email + password.
     */
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public LoginRequest() {}
        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    /**
     * Direct demo registration request: full profile with password.
     */
    public static class SignupRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        private com.campuspulse.domain.User.Role role;
        private String campus;
        private String enrollmentNo;
        private String course;
        private String batchYear;
        private java.util.UUID departmentId;

        public SignupRequest() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public com.campuspulse.domain.User.Role getRole() { return role; }
        public void setRole(com.campuspulse.domain.User.Role role) { this.role = role; }
        public String getCampus() { return campus; }
        public void setCampus(String campus) { this.campus = campus; }
        public String getEnrollmentNo() { return enrollmentNo; }
        public void setEnrollmentNo(String enrollmentNo) { this.enrollmentNo = enrollmentNo; }
        public String getCourse() { return course; }
        public void setCourse(String course) { this.course = course; }
        public String getBatchYear() { return batchYear; }
        public void setBatchYear(String batchYear) { this.batchYear = batchYear; }
        public java.util.UUID getDepartmentId() { return departmentId; }
        public void setDepartmentId(java.util.UUID departmentId) { this.departmentId = departmentId; }
    }
}
