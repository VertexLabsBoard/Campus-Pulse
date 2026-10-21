-- V3__seed_data.sql
-- Seed data: departments, one building (A-Block), floors, and rooms
-- Used in dev and for integration tests. No real student data.

-- ─── Departments ─────────────────────────────────────────────────────────────
INSERT INTO departments (id, name) VALUES
    ('11111111-0000-0000-0000-000000000001', 'IT'),
    ('11111111-0000-0000-0000-000000000002', 'Housekeeping'),
    ('11111111-0000-0000-0000-000000000003', 'Maintenance'),
    ('11111111-0000-0000-0000-000000000004', 'Lab'),
    ('11111111-0000-0000-0000-000000000005', 'Electrical');

-- ─── Building ────────────────────────────────────────────────────────────────
INSERT INTO buildings (id, name, code) VALUES
    ('22222222-0000-0000-0000-000000000001', 'A-Block', 'A');

-- ─── Locations: Ground Floor ─────────────────────────────────────────────────
INSERT INTO locations (id, building_id, floor, room_code, name, qr_token, type) VALUES
    ('33333333-0000-0000-0000-000000000001',
     '22222222-0000-0000-0000-000000000001', 0, 'A-G01', 'Lobby',                   'qrt-a-g01-lobby',       'CORRIDOR'),
    ('33333333-0000-0000-0000-000000000002',
     '22222222-0000-0000-0000-000000000001', 0, 'A-G02', 'Reception',               'qrt-a-g02-reception',   'OTHER'),
    ('33333333-0000-0000-0000-000000000003',
     '22222222-0000-0000-0000-000000000001', 0, 'A-G-WC', 'Ground Floor Washroom',  'qrt-a-g-wc',            'WASHROOM');

-- ─── Locations: First Floor ──────────────────────────────────────────────────
INSERT INTO locations (id, building_id, floor, room_code, name, qr_token, type) VALUES
    ('33333333-0000-0000-0000-000000000004',
     '22222222-0000-0000-0000-000000000001', 1, 'A-101', 'Classroom 101',           'qrt-a-101',             'CLASSROOM'),
    ('33333333-0000-0000-0000-000000000005',
     '22222222-0000-0000-0000-000000000001', 1, 'A-102', 'Classroom 102',           'qrt-a-102',             'CLASSROOM'),
    ('33333333-0000-0000-0000-000000000006',
     '22222222-0000-0000-0000-000000000001', 1, 'A-103', 'Computer Lab 1',          'qrt-a-103-lab',         'LAB'),
    ('33333333-0000-0000-0000-000000000007',
     '22222222-0000-0000-0000-000000000001', 1, 'A-1-WC', 'First Floor Washroom',   'qrt-a-1-wc',            'WASHROOM');

-- ─── Locations: Second Floor ─────────────────────────────────────────────────
INSERT INTO locations (id, building_id, floor, room_code, name, qr_token, type) VALUES
    ('33333333-0000-0000-0000-000000000008',
     '22222222-0000-0000-0000-000000000001', 2, 'A-201', 'Seminar Hall',            'qrt-a-201-seminar',     'CLASSROOM'),
    ('33333333-0000-0000-0000-000000000009',
     '22222222-0000-0000-0000-000000000001', 2, 'A-202', 'Faculty Room',            'qrt-a-202-faculty',     'OTHER'),
    ('33333333-0000-0000-0000-000000000010',
     '22222222-0000-0000-0000-000000000001', 2, 'A-203', 'Electronics Lab',         'qrt-a-203-elab',        'LAB');

-- ─── Default SLA policies ────────────────────────────────────────────────────
-- (respond_within_minutes, resolve_within_minutes)
INSERT INTO sla_policies (category, priority_level, respond_within_minutes, resolve_within_minutes) VALUES
    ('IT',          'CRITICAL', 60,   240),
    ('IT',          'HIGH',     240,  1440),
    ('IT',          'MEDIUM',   480,  4320),
    ('IT',          'LOW',      1440, 10080),
    ('Maintenance', 'CRITICAL', 60,   480),
    ('Maintenance', 'HIGH',     240,  2880),
    ('Maintenance', 'MEDIUM',   480,  7200),
    ('Maintenance', 'LOW',      1440, 20160),
    ('Housekeeping','CRITICAL', 30,   120),
    ('Housekeeping','HIGH',     120,  480),
    ('Housekeeping','MEDIUM',   240,  1440),
    ('Housekeeping','LOW',      480,  2880),
    ('Electrical',  'CRITICAL', 30,   240),
    ('Electrical',  'HIGH',     120,  720),
    ('Electrical',  'MEDIUM',   240,  2880),
    ('Electrical',  'LOW',      480,  7200),
    ('Lab',         'CRITICAL', 60,   480),
    ('Lab',         'HIGH',     240,  1440),
    ('Lab',         'MEDIUM',   480,  4320),
    ('Lab',         'LOW',      1440, 10080);
