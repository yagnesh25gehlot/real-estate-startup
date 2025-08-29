/*
  Warnings:

  - You are about to drop the column `adminOnly` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `Notification` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `userId` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Commission" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "adminOnly",
DROP COLUMN "data",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "action" TEXT NOT NULL DEFAULT 'SELL',
ADD COLUMN     "allowedTenants" TEXT,
ADD COLUMN     "amenities" TEXT,
ADD COLUMN     "area" DOUBLE PRECISION,
ADD COLUMN     "availabilityDate" TIMESTAMP(3),
ADD COLUMN     "bhk" INTEGER,
ADD COLUMN     "bookingCharges" DOUBLE PRECISION,
ADD COLUMN     "dimensions" TEXT,
ADD COLUMN     "electricityBillImage" TEXT,
ADD COLUMN     "furnishingStatus" TEXT,
ADD COLUMN     "leaseDuration" INTEGER,
ADD COLUMN     "listedBy" TEXT,
ADD COLUMN     "noticePeriod" INTEGER,
ADD COLUMN     "numberOfRooms" INTEGER,
ADD COLUMN     "parkingAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "perMonthCharges" DOUBLE PRECISION,
ADD COLUMN     "registryImage" TEXT,
ADD COLUMN     "specifications" TEXT,
ADD COLUMN     "waterBillImage" TEXT,
ALTER COLUMN "mediaUrls" SET NOT NULL,
ALTER COLUMN "mediaUrls" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER';

-- DropEnum
DROP TYPE "Role";
