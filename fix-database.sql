-- Drop existing tables and recreate with proper schema
DROP TABLE IF EXISTS "Commission" CASCADE;
DROP TABLE IF EXISTS "Payment" CASCADE;
DROP TABLE IF EXISTS "Booking" CASCADE;
DROP TABLE IF EXISTS "Property" CASCADE;
DROP TABLE IF EXISTS "Dealer" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Create User table with UUID
CREATE TABLE IF NOT EXISTS "User" (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password VARCHAR(255),
    mobile VARCHAR(20),
    aadhaar VARCHAR(255),
    aadhaarImage VARCHAR(255),
    profilePic VARCHAR(255),
    role VARCHAR(50) DEFAULT 'USER',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Dealer table
CREATE TABLE IF NOT EXISTS "Dealer" (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    userId VARCHAR(255) UNIQUE REFERENCES "User"(id),
    parentId VARCHAR(255) REFERENCES "Dealer"(id),
    commission DECIMAL(10,2) DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'PENDING',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    referralCode VARCHAR(255) UNIQUE
);

-- Create Property table
CREATE TABLE IF NOT EXISTS "Property" (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100),
    location VARCHAR(255),
    address VARCHAR(500) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(10,8),
    price DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'FREE',
    mediaUrls TEXT DEFAULT '[]',
    ownerId VARCHAR(255) REFERENCES "User"(id),
    dealerId VARCHAR(255) REFERENCES "Dealer"(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Booking table
CREATE TABLE IF NOT EXISTS "Booking" (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    propertyId VARCHAR(255) REFERENCES "Property"(id),
    userId VARCHAR(255) REFERENCES "User"(id),
    startDate TIMESTAMP,
    endDate TIMESTAMP,
    dealerCode VARCHAR(255),
    bookingCharges DECIMAL(10,2) DEFAULT 300.0,
    totalAmount DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'PENDING',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paymentMethod VARCHAR(100),
    paymentRef VARCHAR(255),
    paymentProof VARCHAR(255)
);

-- Create Payment table
CREATE TABLE IF NOT EXISTS "Payment" (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    amount DECIMAL(10,2),
    bookingId VARCHAR(255) UNIQUE REFERENCES "Booking"(id),
    stripeId VARCHAR(255) UNIQUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Commission table
CREATE TABLE IF NOT EXISTS "Commission" (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    dealerId VARCHAR(255) REFERENCES "Dealer"(id),
    bookingId VARCHAR(255) REFERENCES "Booking"(id),
    amount DECIMAL(10,2),
    level INTEGER,
    status VARCHAR(50) DEFAULT 'PENDING',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Notification table
CREATE TABLE IF NOT EXISTS "Notification" (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    userId VARCHAR(255) REFERENCES "User"(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_property_owner ON "Property"(ownerId);
CREATE INDEX IF NOT EXISTS idx_booking_property ON "Booking"(propertyId);
CREATE INDEX IF NOT EXISTS idx_booking_user ON "Booking"(userId);
CREATE INDEX IF NOT EXISTS idx_notification_user ON "Notification"(userId);
CREATE INDEX IF NOT EXISTS idx_dealer_user ON "Dealer"(userId);
CREATE INDEX IF NOT EXISTS idx_dealer_referral ON "Dealer"(referralCode);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
