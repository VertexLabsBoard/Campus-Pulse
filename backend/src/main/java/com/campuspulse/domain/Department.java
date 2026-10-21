package com.campuspulse.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "departments")
public class Department extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "head_user_id")
    private UUID headUserId;

    public Department() {}

    public Department(String name, UUID headUserId) {
        this.name = name;
        this.headUserId = headUserId;
    }

    public static DepartmentBuilder builder() {
        return new DepartmentBuilder();
    }

    public static class DepartmentBuilder {
        private String name;
        private UUID headUserId;

        public DepartmentBuilder name(String name) { this.name = name; return this; }
        public DepartmentBuilder headUserId(UUID headUserId) { this.headUserId = headUserId; return this; }

        public Department build() {
            return new Department(name, headUserId);
        }
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public UUID getHeadUserId() { return headUserId; }
    public void setHeadUserId(UUID headUserId) { this.headUserId = headUserId; }
}
