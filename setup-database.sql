-- Create database tables manually
-- Run this using the PostgreSQL connection

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'user',
    status VARCHAR(50) DEFAULT 'active',
    isDealer BOOLEAN DEFAULT false,
    dealerLevel INTEGER DEFAULT 0,
    parentDealerId INTEGER,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Property table
CREATE TABLE IF NOT EXISTS "Property" (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    zipCode VARCHAR(20),
    latitude DECIMAL(10,8),
    longitude DECIMAL(10,8),
    bedrooms INTEGER,
    bathrooms INTEGER,
    area DECIMAL(10,2),
    propertyType VARCHAR(100),
    status VARCHAR(50) DEFAULT 'available',
    ownerId INTEGER REFERENCES "User"(id),
    approved BOOLEAN DEFAULT false,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Booking table
CREATE TABLE IF NOT EXISTS "Booking" (
    id SERIAL PRIMARY KEY,
    propertyId INTEGER REFERENCES "Property"(id),
    userId INTEGER REFERENCES "User"(id),
    dealerId INTEGER REFERENCES "User"(id),
    bookingDate DATE NOT NULL,
    bookingTime TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Commission table
CREATE TABLE IF NOT EXISTS "Commission" (
    id SERIAL PRIMARY KEY,
    bookingId INTEGER REFERENCES "Booking"(id),
    dealerId INTEGER REFERENCES "User"(id),
    amount DECIMAL(10,2),
    level INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Notification table
CREATE TABLE IF NOT EXISTS "Notification" (
    id SERIAL PRIMARY KEY,
    userId INTEGER REFERENCES "User"(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    read BOOLEAN DEFAULT false,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin user
INSERT INTO "User" (email, password, name, role, status) 
VALUES ('admin@example.com', '$2a$10$rQZ8K9mN2pL1xV3yU6wQ7eR4tY5uI8oP9aB2cD3eF4gH5iJ6kL7mN8oP9qR', 'Admin User', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_property_owner ON "Property"(ownerId);
CREATE INDEX IF NOT EXISTS idx_booking_property ON "Booking"(propertyId);
CREATE INDEX IF NOT EXISTS idx_booking_user ON "Booking"(userId);
CREATE INDEX IF NOT EXISTS idx_notification_user ON "Notification"(userId);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
