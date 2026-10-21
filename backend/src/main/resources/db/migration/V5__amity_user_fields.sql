-- V5__amity_user_fields.sql
-- Add enrollment number, course, and batch year for Amity University students

ALTER TABLE users ADD COLUMN IF NOT EXISTS enrollment_no VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS course VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS batch_year VARCHAR(20);
