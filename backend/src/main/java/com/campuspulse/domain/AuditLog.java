package com.campuspulse.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "actor_id")
    private UUID actorId;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(name = "entity_type", nullable = false, length = 100)
    private String entityType;

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "before_val")
    private Map<String, Object> beforeVal;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "after_val")
    private Map<String, Object> afterVal;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant at;

    public AuditLog() {}

    public AuditLog(UUID id, UUID actorId, String action, String entityType, UUID entityId, Map<String, Object> beforeVal, Map<String, Object> afterVal, Instant at) {
        this.id = id;
        this.actorId = actorId;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.beforeVal = beforeVal;
        this.afterVal = afterVal;
        this.at = at;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID id;
        private UUID actorId;
        private String action;
        private String entityType;
        private UUID entityId;
        private Map<String, Object> beforeVal;
        private Map<String, Object> afterVal;
        private Instant at;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder actorId(UUID actorId) { this.actorId = actorId; return this; }
        public Builder action(String action) { this.action = action; return this; }
        public Builder entityType(String entityType) { this.entityType = entityType; return this; }
        public Builder entityId(UUID entityId) { this.entityId = entityId; return this; }
        public Builder beforeVal(Map<String, Object> beforeVal) { this.beforeVal = beforeVal; return this; }
        public Builder afterVal(Map<String, Object> afterVal) { this.afterVal = afterVal; return this; }
        public Builder at(Instant at) { this.at = at; return this; }
        public AuditLog build() { return new AuditLog(id, actorId, action, entityType, entityId, beforeVal, afterVal, at); }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getActorId() { return actorId; }
    public void setActorId(UUID actorId) { this.actorId = actorId; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public UUID getEntityId() { return entityId; }
    public void setEntityId(UUID entityId) { this.entityId = entityId; }
    public Map<String, Object> getBeforeVal() { return beforeVal; }
    public void setBeforeVal(Map<String, Object> beforeVal) { this.beforeVal = beforeVal; }
    public Map<String, Object> getAfterVal() { return afterVal; }
    public void setAfterVal(Map<String, Object> afterVal) { this.afterVal = afterVal; }
    public Instant getAt() { return at; }
    public void setAt(Instant at) { this.at = at; }
}
