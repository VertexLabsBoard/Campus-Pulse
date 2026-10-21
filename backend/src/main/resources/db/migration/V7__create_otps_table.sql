-- V7__create_otps_table.sql
-- Persistent OTP table for authentication verification with expiration & audit logging

CREATE TABLE IF NOT EXISTS otps (
    id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email                VARCHAR(255) NOT NULL,
    purpose              VARCHAR(50)  NOT NULL,
    otp_code             VARCHAR(6)   NOT NULL,
    expires_at           TIMESTAMPTZ  NOT NULL,
    resend_allowed_after TIMESTAMPTZ  NOT NULL,
    attempts             INT          NOT NULL DEFAULT 0,
    verified             BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otps_email_purpose ON otps(email, purpose);
CREATE INDEX IF NOT EXISTS idx_otps_expires_at ON otps(expires_at);
