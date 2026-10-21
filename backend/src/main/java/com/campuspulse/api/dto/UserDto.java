package com.campuspulse.api.dto;

import com.campuspulse.domain.User;
import java.util.UUID;

public class UserDto {
    private UUID id;
    private String email;
    private String name;
    private User.Role role;
    private String enrollmentNo;
    private String course;
    private String batchYear;
    private String campus;
    private UUID departmentId;
    private String departmentName;

    public UserDto() {}

    public UserDto(UUID id, String email, String name, User.Role role, String enrollmentNo, String course, String batchYear, String campus, UUID departmentId, String departmentName) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
        this.enrollmentNo = enrollmentNo;
        this.course = course;
        this.batchYear = batchYear;
        this.campus = campus;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
    }

    public static UserDtoBuilder builder() {
        return new UserDtoBuilder();
    }

    public static class UserDtoBuilder {
        private UUID id;
        private String email;
        private String name;
        private User.Role role;
        private String enrollmentNo;
        private String course;
        private String batchYear;
        private String campus;
        private UUID departmentId;
        private String departmentName;

        public UserDtoBuilder id(UUID id) { this.id = id; return this; }
        public UserDtoBuilder email(String email) { this.email = email; return this; }
        public UserDtoBuilder name(String name) { this.name = name; return this; }
        public UserDtoBuilder role(User.Role role) { this.role = role; return this; }
        public UserDtoBuilder enrollmentNo(String enrollmentNo) { this.enrollmentNo = enrollmentNo; return this; }
        public UserDtoBuilder course(String course) { this.course = course; return this; }
        public UserDtoBuilder batchYear(String batchYear) { this.batchYear = batchYear; return this; }
        public UserDtoBuilder campus(String campus) { this.campus = campus; return this; }
        public UserDtoBuilder departmentId(UUID departmentId) { this.departmentId = departmentId; return this; }
        public UserDtoBuilder departmentName(String departmentName) { this.departmentName = departmentName; return this; }

        public UserDto build() {
            return new UserDto(id, email, name, role, enrollmentNo, course, batchYear, campus, departmentId, departmentName);
        }
    }

    public static UserDto from(User user, String departmentName) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .enrollmentNo(user.getEnrollmentNo())
                .course(user.getCourse())
                .batchYear(user.getBatchYear())
                .campus(user.getCampus())
                .departmentId(user.getDepartmentId())
                .departmentName(departmentName)
                .build();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public User.Role getRole() { return role; }
    public void setRole(User.Role role) { this.role = role; }
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
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
}
