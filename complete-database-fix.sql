-- Complete Database Fix - Drop and recreate all tables to match Prisma schema exactly
-- This will resolve all database issues

-- Drop all tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS "Commission" CASCADE;
DROP TABLE IF EXISTS "Payment" CASCADE;
DROP TABLE IF EXISTS "Booking" CASCADE;
DROP TABLE IF EXISTS "Property" CASCADE;
DROP TABLE IF EXISTS "Dealer" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Create User table with exact Prisma schema
CREATE TABLE IF NOT EXISTS "User" (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password VARCHAR(255),
    mobile VARCHAR(255),
    aadhaar VARCHAR(255),
    aadhaarImage VARCHAR(255),
    profilePic VARCHAR(255),
    role VARCHAR(255) DEFAULT 'USER',
    status VARCHAR(255) DEFAULT 'ACTIVE',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Dealer table with exact Prisma schema
CREATE TABLE IF NOT EXISTS "Dealer" (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    userId VARCHAR(255) UNIQUE REFERENCES "User"(id),
    parentId VARCHAR(255) REFERENCES "Dealer"(id),
    commission DECIMAL(10,2) DEFAULT 0.0,
    status VARCHAR(255) DEFAULT 'PENDING',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    referralCode VARCHAR(255) UNIQUE
);

-- Create Property table with exact Prisma schema
CREATE TABLE IF NOT EXISTS "Property" (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(255),
    location VARCHAR(255),
    address VARCHAR(255) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(10,8),
    price DECIMAL(10,2),
    status VARCHAR(255) DEFAULT 'FREE',
    mediaUrls TEXT DEFAULT '[]',
    ownerId VARCHAR(255) REFERENCES "User"(id),
    dealerId VARCHAR(255) REFERENCES "Dealer"(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Booking table with exact Prisma schema
CREATE TABLE IF NOT EXISTS "Booking" (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    propertyId VARCHAR(255) REFERENCES "Property"(id),
    userId VARCHAR(255) REFERENCES "User"(id),
    startDate TIMESTAMP,
    endDate TIMESTAMP,
    dealerCode VARCHAR(255),
    bookingCharges DECIMAL(10,2) DEFAULT 300.0,
    totalAmount DECIMAL(10,2),
    status VARCHAR(255) DEFAULT 'PENDING',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paymentMethod VARCHAR(255),
    paymentRef VARCHAR(255),
    paymentProof VARCHAR(255)
);

-- Create Payment table with exact Prisma schema
CREATE TABLE IF NOT EXISTS "Payment" (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    amount DECIMAL(10,2),
    bookingId VARCHAR(255) UNIQUE REFERENCES "Booking"(id),
    stripeId VARCHAR(255) UNIQUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Commission table with exact Prisma schema
CREATE TABLE IF NOT EXISTS "Commission" (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    dealerId VARCHAR(255) REFERENCES "Dealer"(id),
    propertyId VARCHAR(255) REFERENCES "Property"(id),
    amount DECIMAL(10,2),
    level INTEGER,
    status VARCHAR(255) DEFAULT 'PENDING',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create CommissionConfig table with exact Prisma schema
CREATE TABLE IF NOT EXISTS "CommissionConfig" (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    level INTEGER UNIQUE,
    percentage DECIMAL(5,2),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Notification table with exact Prisma schema
CREATE TABLE IF NOT EXISTS "Notification" (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    userId VARCHAR(255) REFERENCES "User"(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(255),
    read BOOLEAN DEFAULT false,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin user
INSERT INTO "User" (id, email, password, name, role, status) 
VALUES (
    gen_random_uuid()::text,
    'admin@example.com', 
    '$2a$10$rQZ8K9mN2pL1xV3yU6wQ7eR4tY5uI8oP9aB2cD3eF4gH5iJ6kL7mN8oP9qR', 
    'Admin User', 
    'ADMIN', 
    'ACTIVE'
) ON CONFLICT (email) DO NOTHING;

-- Insert default commission config
INSERT INTO "CommissionConfig" (id, level, percentage) VALUES
(gen_random_uuid()::text, 1, 10.0),
(gen_random_uuid()::text, 2, 5.0),
(gen_random_uuid()::text, 3, 2.5)
ON CONFLICT (level) DO NOTHING;

-- Create all necessary indexes
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_property_owner ON "Property"(ownerId);
CREATE INDEX IF NOT EXISTS idx_property_dealer ON "Property"(dealerId);
CREATE INDEX IF NOT EXISTS idx_booking_property ON "Booking"(propertyId);
CREATE INDEX IF NOT EXISTS idx_booking_user ON "Booking"(userId);
CREATE INDEX IF NOT EXISTS idx_notification_user ON "Notification"(userId);
CREATE INDEX IF NOT EXISTS idx_dealer_user ON "Dealer"(userId);
CREATE INDEX IF NOT EXISTS idx_dealer_referral ON "Dealer"(referralCode);
CREATE INDEX IF NOT EXISTS idx_commission_dealer ON "Commission"(dealerId);
CREATE INDEX IF NOT EXISTS idx_commission_property ON "Commission"(propertyId);

-- Grant all permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Verify tables were created correctly
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('User', 'Property', 'Booking', 'Dealer', 'Payment', 'Commission', 'Notification', 'CommissionConfig')
ORDER BY table_name, ordinal_position;
