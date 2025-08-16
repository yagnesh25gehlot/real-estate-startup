-- Fix Booking table structure to match Prisma schema
DROP TABLE IF EXISTS "Booking" CASCADE;

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_booking_property ON "Booking"(propertyId);
CREATE INDEX IF NOT EXISTS idx_booking_user ON "Booking"(userId);
