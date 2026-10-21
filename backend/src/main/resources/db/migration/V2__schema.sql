-- V2__schema.sql
-- Phase 1–2 full schema per PROJECT_SPEC.md §5
-- All tables have id (UUID PK), created_at, updated_at.

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Departments ─────────────────────────────────────────────────────────────
CREATE TABLE departments (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(100) NOT NULL UNIQUE,
    head_user_id UUID,        -- FK to users added after users table
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Users ───────────────────────────────────────────────────────────────────
CREATE TABLE users (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email                 VARCHAR(255) NOT NULL UNIQUE,
    name                  VARCHAR(255) NOT NULL,
    role                  VARCHAR(20)  NOT NULL CHECK (role IN ('STUDENT','STAFF','ADMIN')),
    department_id         UUID         REFERENCES departments(id) ON DELETE SET NULL,
    active                BOOLEAN      NOT NULL DEFAULT TRUE,
    hide_name_from_students BOOLEAN    NOT NULL DEFAULT FALSE,
    -- For dev-only local auth (nullable — used only in dev profile)
    password_hash         VARCHAR(255),
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Add FK from departments to users now that users table exists
ALTER TABLE departments
    ADD CONSTRAINT fk_departments_head_user
    FOREIGN KEY (head_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- ─── Buildings ───────────────────────────────────────────────────────────────
CREATE TABLE buildings (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(200) NOT NULL,
    code       VARCHAR(20)  NOT NULL UNIQUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ─── Locations ───────────────────────────────────────────────────────────────
CREATE TABLE locations (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID        NOT NULL REFERENCES buildings(id) ON DELETE RESTRICT,
    floor       SMALLINT    NOT NULL,
    room_code   VARCHAR(50) NOT NULL,
    name        VARCHAR(200) NOT NULL,
    qr_token    VARCHAR(100) NOT NULL UNIQUE,  -- unguessable, generated at insert
    type        VARCHAR(20)  NOT NULL CHECK (type IN ('CLASSROOM','LAB','CORRIDOR','WASHROOM','OTHER')),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (building_id, floor, room_code)
);

-- ─── Assets ──────────────────────────────────────────────────────────────────
CREATE TABLE assets (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID        NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    asset_tag   VARCHAR(100) NOT NULL UNIQUE,
    type        VARCHAR(20)  NOT NULL CHECK (type IN ('PROJECTOR','AC','PC','LIGHT','OTHER')),
    qr_token    VARCHAR(100) NOT NULL UNIQUE,
    installed_on DATE,
    status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','RETIRED','MAINTENANCE')),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ─── Issues ──────────────────────────────────────────────────────────────────
CREATE SEQUENCE issue_ticket_seq START 1000;

CREATE TABLE issues (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_no               VARCHAR(20)  NOT NULL UNIQUE DEFAULT ('CP-' || nextval('issue_ticket_seq')),
    reporter_id             UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    location_id             UUID        NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    asset_id                UUID             REFERENCES assets(id) ON DELETE SET NULL,
    category                VARCHAR(50)  NOT NULL,
    description             TEXT         NOT NULL,
    severity                SMALLINT     NOT NULL CHECK (severity BETWEEN 1 AND 5),
    safety_flag             BOOLEAN      NOT NULL DEFAULT FALSE,
    status                  VARCHAR(20)  NOT NULL DEFAULT 'SUBMITTED'
                                CHECK (status IN ('SUBMITTED','VERIFIED','ASSIGNED','IN_PROGRESS',
                                                  'RESOLVED','CLOSED','REJECTED','DUPLICATE','REOPENED')),
    priority_score          NUMERIC(5,2),
    priority_level          VARCHAR(10)  CHECK (priority_level IN ('CRITICAL','HIGH','MEDIUM','LOW')),
    priority_explanation    JSONB,
    priority_override_reason TEXT,
    department_id           UUID             REFERENCES departments(id) ON DELETE SET NULL,
    assignee_id             UUID             REFERENCES users(id) ON DELETE SET NULL,
    duplicate_of_issue_id   UUID             REFERENCES issues(id) ON DELETE SET NULL,
    sla_due_at              TIMESTAMPTZ,
    first_response_at       TIMESTAMPTZ,
    resolved_at             TIMESTAMPTZ,
    closed_at               TIMESTAMPTZ,
    version                 BIGINT       NOT NULL DEFAULT 0,   -- optimistic locking
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_issues_reporter    ON issues(reporter_id);
CREATE INDEX idx_issues_location    ON issues(location_id);
CREATE INDEX idx_issues_department  ON issues(department_id);
CREATE INDEX idx_issues_status      ON issues(status);
CREATE INDEX idx_issues_priority    ON issues(priority_score DESC);

-- ─── Issue Supporters ("I'm affected too") ───────────────────────────────────
CREATE TABLE issue_supporters (
    issue_id   UUID        NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (issue_id, user_id)
);

-- ─── Issue Comments ───────────────────────────────────────────────────────────
CREATE TABLE issue_comments (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id   UUID        NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    author_id  UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    body       TEXT        NOT NULL,
    internal   BOOLEAN     NOT NULL DEFAULT FALSE,  -- staff-only flag
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_issue ON issue_comments(issue_id);

-- ─── Issue Attachments ───────────────────────────────────────────────────────
CREATE TABLE issue_attachments (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id    UUID        NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    uploader_id UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    storage_key VARCHAR(500) NOT NULL UNIQUE,
    kind        VARCHAR(10)  NOT NULL CHECK (kind IN ('REPORT','BEFORE','AFTER')),
    mime        VARCHAR(100) NOT NULL,
    size        BIGINT       NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ─── Issue Status History ────────────────────────────────────────────────────
CREATE TABLE issue_status_history (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id    UUID        NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    from_status VARCHAR(20),
    to_status   VARCHAR(20) NOT NULL,
    changed_by  UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reason      TEXT,
    changed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_history_issue ON issue_status_history(issue_id);

-- ─── Audit Log ───────────────────────────────────────────────────────────────
CREATE TABLE audit_log (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID             REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id   UUID         NOT NULL,
    before_val  JSONB,
    after_val   JSONB,
    at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_entity  ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_actor   ON audit_log(actor_id);

-- ─── Notifications ───────────────────────────────────────────────────────────
CREATE TABLE notifications (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    issue_id   UUID             REFERENCES issues(id) ON DELETE CASCADE,
    type       VARCHAR(50)  NOT NULL,
    message    TEXT         NOT NULL,
    read_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read_at);

-- ─── SLA Policies ────────────────────────────────────────────────────────────
CREATE TABLE sla_policies (
    id                      UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
    category                VARCHAR(50) NOT NULL,
    priority_level          VARCHAR(10) NOT NULL CHECK (priority_level IN ('CRITICAL','HIGH','MEDIUM','LOW')),
    respond_within_minutes  INT        NOT NULL,
    resolve_within_minutes  INT        NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (category, priority_level)
);

-- ─── Schedules (timetable) ───────────────────────────────────────────────────
CREATE TABLE schedules (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID        NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    day_of_week SMALLINT    NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time  TIME        NOT NULL,
    end_time    TIME        NOT NULL,
    label       VARCHAR(50) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Duty Roster ─────────────────────────────────────────────────────────────
CREATE TABLE duty_roster (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID       NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    user_id       UUID       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date          DATE       NOT NULL,
    shift_start   TIME       NOT NULL,
    shift_end     TIME       NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Feedback ────────────────────────────────────────────────────────────────
CREATE TABLE feedback (
    id              UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id        UUID       NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    user_id         UUID       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fixed_confirmed BOOLEAN    NOT NULL,
    rating          SMALLINT   CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (issue_id, user_id)
);
