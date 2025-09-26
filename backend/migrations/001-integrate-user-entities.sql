-- Migration to integrate User entity with Painter/Customer entities
-- This migration transforms the isolated entities into a user-centric architecture

-- Step 1: Add userId columns to painters and customers tables
ALTER TABLE painters ADD COLUMN userId INTEGER UNIQUE;
ALTER TABLE customers ADD COLUMN userId INTEGER UNIQUE;

-- Step 2: Update bookings table to use userId instead of separate IDs
ALTER TABLE bookings ADD COLUMN painterUserId INTEGER;
ALTER TABLE bookings ADD COLUMN customerUserId INTEGER;

-- Step 3: Update availabilities table to use userId
ALTER TABLE availabilities ADD COLUMN painterUserId INTEGER;

-- Step 4: Create foreign key constraints
ALTER TABLE painters ADD CONSTRAINT FK_painters_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE customers ADD CONSTRAINT FK_customers_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD CONSTRAINT FK_bookings_painter_user FOREIGN KEY (painterUserId) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD CONSTRAINT FK_bookings_customer_user FOREIGN KEY (customerUserId) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE availabilities ADD CONSTRAINT FK_availabilities_painter_user FOREIGN KEY (painterUserId) REFERENCES users(id) ON DELETE CASCADE;

-- Step 5: Migrate existing data (if any)
-- This would need to be customized based on existing data
-- For now, we'll assume this is a fresh setup

-- Step 6: Drop old foreign key constraints and columns (after data migration)
-- ALTER TABLE bookings DROP CONSTRAINT IF EXISTS FK_bookings_painter;
-- ALTER TABLE bookings DROP CONSTRAINT IF EXISTS FK_bookings_customer;
-- ALTER TABLE availabilities DROP CONSTRAINT IF EXISTS FK_availabilities_painter;
-- ALTER TABLE bookings DROP COLUMN IF EXISTS painterId;
-- ALTER TABLE bookings DROP COLUMN IF EXISTS customerId;
-- ALTER TABLE availabilities DROP COLUMN IF EXISTS painterId;

-- Step 7: Remove duplicate columns from painters and customers
-- ALTER TABLE painters DROP COLUMN IF EXISTS name;
-- ALTER TABLE customers DROP COLUMN IF EXISTS name;
-- ALTER TABLE customers DROP COLUMN IF EXISTS email;
-- ALTER TABLE customers DROP COLUMN IF EXISTS phone;
