package com.campuspulse.api.dto;

import com.campuspulse.domain.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.UUID;

public class AuthDtos {

    public static class SignupSendOtpRequest {
        @NotNull(message = "Role is required (STUDENT or STAFF)")
        private User.Role role;

        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        private String enrollmentNo;
        private String course;
        private String batchYear;
        private String campus;
        private UUID departmentId;

        public SignupSendOtpRequest() {}

        public User.Role getRole() { return role; }
        public void setRole(User.Role role) { this.role = role; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getEnrollmentNo() { return enrollmentNo; }
        public void setEnrollmentNo(String enrollmentNo) { this.enrollmentNo = enrollmentNo; }
        public String getCourse() { return course; }
        public void setCourse(String course) { this.course = course; }
        public String getBatchYear() { return batchYear; }
        public void setBatchYear(String batchYear) { this.batchYear = batchYear; }
        public String getCampus() { return campus; }
        public void setCampus(String campus) { this.campus = campus; }
        public UUID getDepartmentId() { return departmentId; }
        public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }
    }

    public static class SignupVerifyRequest {
        @NotNull(message = "Role is required (STUDENT or STAFF)")
        private User.Role role;

        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        private String enrollmentNo;
        private String course;
        private String batchYear;
        private String campus;
        private UUID departmentId;

        @NotBlank(message = "OTP is required")
        @Pattern(regexp = "^\\d{6}$", message = "OTP must be exactly 6 digits")
        private String otp;

        public SignupVerifyRequest() {}

        public User.Role getRole() { return role; }
        public void setRole(User.Role role) { this.role = role; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getEnrollmentNo() { return enrollmentNo; }
        public void setEnrollmentNo(String enrollmentNo) { this.enrollmentNo = enrollmentNo; }
        public String getCourse() { return course; }
        public void setCourse(String course) { this.course = course; }
        public String getBatchYear() { return batchYear; }
        public void setBatchYear(String batchYear) { this.batchYear = batchYear; }
        public String getCampus() { return campus; }
        public void setCampus(String campus) { this.campus = campus; }
        public UUID getDepartmentId() { return departmentId; }
        public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }
        public String getOtp() { return otp; }
        public void setOtp(String otp) { this.otp = otp; }
    }

    public static class LoginSendOtpRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        public LoginSendOtpRequest() {}
        public LoginSendOtpRequest(String email) { this.email = email; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class LoginVerifyRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "OTP is required")
        @Pattern(regexp = "^\\d{6}$", message = "OTP must be exactly 6 digits")
        private String otp;

        public LoginVerifyRequest() {}
        public LoginVerifyRequest(String email, String otp) {
            this.email = email;
            this.otp = otp;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getOtp() { return otp; }
        public void setOtp(String otp) { this.otp = otp; }
    }

    public static class OtpResponse {
        private String message;
        private String email;
        private String devOtp;
        private long expiresInSeconds;

        public OtpResponse() {}

        public OtpResponse(String message, String email, String devOtp, long expiresInSeconds) {
            this.message = message;
            this.email = email;
            this.devOtp = devOtp;
            this.expiresInSeconds = expiresInSeconds;
        }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getDevOtp() { return devOtp; }
        public void setDevOtp(String devOtp) { this.devOtp = devOtp; }
        public long getExpiresInSeconds() { return expiresInSeconds; }
        public void setExpiresInSeconds(long expiresInSeconds) { this.expiresInSeconds = expiresInSeconds; }
    }
}
