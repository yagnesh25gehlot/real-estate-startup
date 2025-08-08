-- First, add the new columns with default values
ALTER TABLE "Booking" ADD COLUMN "bookingCharges" DOUBLE PRECISION NOT NULL DEFAULT 300.0;
ALTER TABLE "Booking" ADD COLUMN "dealerCode" TEXT;
ALTER TABLE "Booking" ADD COLUMN "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 300.0;
ALTER TABLE "Booking" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to have proper values
UPDATE "Booking" SET 
  "totalAmount" = 300.0,
  "updatedAt" = "createdAt"
WHERE "totalAmount" IS NULL OR "updatedAt" IS NULL;
