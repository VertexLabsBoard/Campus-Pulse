package com.campuspulse.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "buildings")
public class Building extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    public Building() {}

    public Building(String name, String code) {
        this.name = name;
        this.code = code;
    }

    public static BuildingBuilder builder() {
        return new BuildingBuilder();
    }

    public static class BuildingBuilder {
        private String name;
        private String code;

        public BuildingBuilder name(String name) { this.name = name; return this; }
        public BuildingBuilder code(String code) { this.code = code; return this; }

        public Building build() {
            return new Building(name, code);
        }
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}
