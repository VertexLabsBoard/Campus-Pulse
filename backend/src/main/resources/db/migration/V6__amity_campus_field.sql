-- V6__amity_campus_field.sql
-- Add campus branch for Amity University and widen course title length

ALTER TABLE users ADD COLUMN IF NOT EXISTS campus VARCHAR(100);
ALTER TABLE users ALTER COLUMN course TYPE VARCHAR(255);
