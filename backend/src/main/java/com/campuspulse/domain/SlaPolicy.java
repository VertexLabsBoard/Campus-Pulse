package com.campuspulse.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "sla_policies", uniqueConstraints = @UniqueConstraint(columnNames = {"category", "priority_level"}))
public class SlaPolicy extends BaseEntity {

    @Column(nullable = false, length = 50)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority_level", nullable = false, length = 10)
    private Issue.PriorityLevel priorityLevel;

    @Column(name = "respond_within_minutes", nullable = false)
    private Integer respondWithinMinutes;

    @Column(name = "resolve_within_minutes", nullable = false)
    private Integer resolveWithinMinutes;

    public SlaPolicy() {}

    public SlaPolicy(String category, Issue.PriorityLevel priorityLevel, Integer respondWithinMinutes, Integer resolveWithinMinutes) {
        this.category = category;
        this.priorityLevel = priorityLevel;
        this.respondWithinMinutes = respondWithinMinutes;
        this.resolveWithinMinutes = resolveWithinMinutes;
    }

    public static SlaPolicyBuilder builder() {
        return new SlaPolicyBuilder();
    }

    public static class SlaPolicyBuilder {
        private String category;
        private Issue.PriorityLevel priorityLevel;
        private Integer respondWithinMinutes;
        private Integer resolveWithinMinutes;

        public SlaPolicyBuilder category(String category) { this.category = category; return this; }
        public SlaPolicyBuilder priorityLevel(Issue.PriorityLevel priorityLevel) { this.priorityLevel = priorityLevel; return this; }
        public SlaPolicyBuilder respondWithinMinutes(Integer respondWithinMinutes) { this.respondWithinMinutes = respondWithinMinutes; return this; }
        public SlaPolicyBuilder resolveWithinMinutes(Integer resolveWithinMinutes) { this.resolveWithinMinutes = resolveWithinMinutes; return this; }

        public SlaPolicy build() {
            return new SlaPolicy(category, priorityLevel, respondWithinMinutes, resolveWithinMinutes);
        }
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Issue.PriorityLevel getPriorityLevel() { return priorityLevel; }
    public void setPriorityLevel(Issue.PriorityLevel priorityLevel) { this.priorityLevel = priorityLevel; }
    public Integer getRespondWithinMinutes() { return respondWithinMinutes; }
    public void setRespondWithinMinutes(Integer respondWithinMinutes) { this.respondWithinMinutes = respondWithinMinutes; }
    public Integer getResolveWithinMinutes() { return resolveWithinMinutes; }
    public void setResolveWithinMinutes(Integer resolveWithinMinutes) { this.resolveWithinMinutes = resolveWithinMinutes; }
}
