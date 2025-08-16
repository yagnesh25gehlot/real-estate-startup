-- Verify database schema against Prisma schema
-- This script checks if all required columns exist in the database

-- Check Property table columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Property'
ORDER BY ordinal_position;

-- Check User table columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'User'
ORDER BY ordinal_position;

-- Check Booking table columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Booking'
ORDER BY ordinal_position;

-- Check Dealer table columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Dealer'
ORDER BY ordinal_position;

-- Check Payment table columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Payment'
ORDER BY ordinal_position;

-- Check Commission table columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Commission'
ORDER BY ordinal_position;

-- Check Notification table columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Notification'
ORDER BY ordinal_position;
