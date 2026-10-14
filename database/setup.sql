-- ---------------------------------------------------------------
-- One-time database + user creation.
-- Run as a PostgreSQL superuser (usually "postgres"):
--   psql -U postgres -f database/setup.sql
--
-- If the role/databases already exist you will see "already exists"
-- errors - that is harmless, continue with the next step.
-- ---------------------------------------------------------------

CREATE USER inventory_user WITH PASSWORD 'inventory_pass';

-- Main application database
CREATE DATABASE inventory_db OWNER inventory_user;

-- Separate database used ONLY by automated tests (tests wipe its data)
CREATE DATABASE inventory_test_db OWNER inventory_user;
