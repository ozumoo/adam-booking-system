-- Initialize the painter_booking_db database
-- This file is executed when the PostgreSQL container starts for the first time

-- Create database if it doesn't exist (this is handled by POSTGRES_DB env var)
-- CREATE DATABASE IF NOT EXISTS painter_booking_db;

-- Connect to the database
\c painter_booking_db;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The tables will be created automatically by TypeORM when the application starts
-- This file can be used for any additional initialization if needed
