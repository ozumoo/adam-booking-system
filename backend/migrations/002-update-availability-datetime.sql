-- Migration to update availability table to use datetime instead of day + time
-- Drop existing columns and add new datetime columns

ALTER TABLE availabilities 
DROP COLUMN IF EXISTS dayOfWeek,
DROP COLUMN IF EXISTS startTime,
DROP COLUMN IF EXISTS endTime;

ALTER TABLE availabilities 
ADD COLUMN startTime TIMESTAMP NOT NULL,
ADD COLUMN endTime TIMESTAMP NOT NULL;
