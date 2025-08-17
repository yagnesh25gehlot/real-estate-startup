-- Fix missing mediaUrls column in Property table
-- This script adds the mediaUrls column that exists in Prisma schema but is missing from the database

-- Add mediaUrls column to Property table
ALTER TABLE "Property" ADD COLUMN "mediaUrls" TEXT DEFAULT '[]';

-- Update existing properties to have empty mediaUrls array
UPDATE "Property" SET "mediaUrls" = '[]' WHERE "mediaUrls" IS NULL;

-- Make mediaUrls NOT NULL after setting default values
ALTER TABLE "Property" ALTER COLUMN "mediaUrls" SET NOT NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'Property' AND column_name = 'mediaUrls';
