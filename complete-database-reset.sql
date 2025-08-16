-- Complete Database Reset Script
-- This script completely recreates all tables to match the Prisma schema exactly

-- Drop all tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "Payment" CASCADE;
DROP TABLE IF EXISTS "Commission" CASCADE;
DROP TABLE IF EXISTS "Booking" CASCADE;
DROP TABLE IF EXISTS "Property" CASCADE;
DROP TABLE IF EXISTS "Dealer" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Create User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "mobile" TEXT,
    "aadhaar" TEXT,
    "aadhaarImage" TEXT,
    "profilePic" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create Dealer table
CREATE TABLE "Dealer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referralCode" TEXT NOT NULL,

    CONSTRAINT "Dealer_pkey" PRIMARY KEY ("id")
);

-- Create Property table with ALL required columns
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "price" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'FREE',
    "mediaUrls" TEXT NOT NULL DEFAULT '[]',
    "ownerId" TEXT NOT NULL,
    "dealerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- Create Booking table
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "dealerCode" TEXT,
    "bookingCharges" DOUBLE PRECISION NOT NULL DEFAULT 300.0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT,
    "paymentRef" TEXT,
    "paymentProof" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- Create Payment table
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "bookingId" TEXT NOT NULL,
    "stripeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- Create Commission table
CREATE TABLE "Commission" (
    "id" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- Create Notification table
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "Dealer" ADD CONSTRAINT "Dealer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Dealer" ADD CONSTRAINT "Dealer_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Dealer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Property" ADD CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Property" ADD CONSTRAINT "Property_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "Dealer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "Dealer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create unique constraints
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Dealer_userId_key" ON "Dealer"("userId");
CREATE UNIQUE INDEX "Dealer_referralCode_key" ON "Dealer"("referralCode");
CREATE UNIQUE INDEX "Payment_bookingId_key" ON "Payment"("bookingId");
CREATE UNIQUE INDEX "Payment_stripeId_key" ON "Payment"("stripeId");

-- Insert initial data
INSERT INTO "User" ("id", "email", "name", "password", "role", "status") VALUES 
('admin-user-id', 'admin@example.com', 'Admin User', '$2b$10$hashedpassword', 'ADMIN', 'ACTIVE');

INSERT INTO "Commission" ("id", "dealerId", "propertyId", "bookingId", "amount", "status") VALUES 
('default-commission-id', 'default-dealer-id', 'default-property-id', 'default-booking-id', 5.0, 'PENDING');

-- Verify tables were created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
