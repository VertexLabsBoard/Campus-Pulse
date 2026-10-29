-- V8__drop_otps_table.sql
-- Email OTP authentication has been removed.
-- The otps table is no longer needed.
-- Dropping it to keep the schema clean.

DROP TABLE IF EXISTS otps;
