-- V4__seed_users.sql
-- Seed users for local development and testing.

INSERT INTO users (id, email, name, role, department_id, active, hide_name_from_students) VALUES
    ('44444444-0000-0000-0000-000000000001', 'student@college.edu', 'Arjun Sharma', 'STUDENT', NULL, true, false),
    ('44444444-0000-0000-0000-000000000002', 'staff.it@college.edu', 'Priya Patel', 'STAFF', '11111111-0000-0000-0000-000000000001', true, false),
    ('44444444-0000-0000-0000-000000000003', 'staff.maint@college.edu', 'Ramesh Kumar', 'STAFF', '11111111-0000-0000-0000-000000000003', true, false),
    ('44444444-0000-0000-0000-000000000004', 'admin@college.edu', 'Dr. Vikram Sen', 'ADMIN', NULL, true, false)
ON CONFLICT (email) DO NOTHING;

-- Set department heads
UPDATE departments SET head_user_id = '44444444-0000-0000-0000-000000000002' WHERE id = '11111111-0000-0000-0000-000000000001';
UPDATE departments SET head_user_id = '44444444-0000-0000-0000-000000000003' WHERE id = '11111111-0000-0000-0000-000000000003';
