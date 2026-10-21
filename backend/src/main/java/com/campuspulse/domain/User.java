package com.campuspulse.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User extends BaseEntity {

    public enum Role { STUDENT, STAFF, ADMIN }

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "enrollment_no", length = 50)
    private String enrollmentNo;

    @Column(length = 255)
    private String course;

    @Column(name = "batch_year", length = 20)
    private String batchYear;

    @Column(length = 100)
    private String campus;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "hide_name_from_students", nullable = false)
    private boolean hideNameFromStudents = false;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    public User() {}

    public User(String email, String name, Role role, String enrollmentNo, String course, String batchYear, String campus, UUID departmentId, boolean active, boolean hideNameFromStudents, String passwordHash) {
        this.email = email;
        this.name = name;
        this.role = role;
        this.enrollmentNo = enrollmentNo;
        this.course = course;
        this.batchYear = batchYear;
        this.campus = campus;
        this.departmentId = departmentId;
        this.active = active;
        this.hideNameFromStudents = hideNameFromStudents;
        this.passwordHash = passwordHash;
    }

    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private String email;
        private String name;
        private Role role;
        private String enrollmentNo;
        private String course;
        private String batchYear;
        private String campus;
        private UUID departmentId;
        private boolean active = true;
        private boolean hideNameFromStudents = false;
        private String passwordHash;

        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder name(String name) { this.name = name; return this; }
        public UserBuilder role(Role role) { this.role = role; return this; }
        public UserBuilder enrollmentNo(String enrollmentNo) { this.enrollmentNo = enrollmentNo; return this; }
        public UserBuilder course(String course) { this.course = course; return this; }
        public UserBuilder batchYear(String batchYear) { this.batchYear = batchYear; return this; }
        public UserBuilder campus(String campus) { this.campus = campus; return this; }
        public UserBuilder departmentId(UUID departmentId) { this.departmentId = departmentId; return this; }
        public UserBuilder active(boolean active) { this.active = active; return this; }
        public UserBuilder hideNameFromStudents(boolean hideNameFromStudents) { this.hideNameFromStudents = hideNameFromStudents; return this; }
        public UserBuilder passwordHash(String passwordHash) { this.passwordHash = passwordHash; return this; }

        public User build() {
            return new User(email, name, role, enrollmentNo, course, batchYear, campus, departmentId, active, hideNameFromStudents, passwordHash);
        }
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
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
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public boolean isHideNameFromStudents() { return hideNameFromStudents; }
    public void setHideNameFromStudents(boolean hideNameFromStudents) { this.hideNameFromStudents = hideNameFromStudents; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
}
