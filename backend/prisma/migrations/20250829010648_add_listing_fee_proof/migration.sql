-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "additionalAmenities" TEXT,
ADD COLUMN     "listingFeeProof" TEXT,
ADD COLUMN     "mobileNumber" TEXT,
ADD COLUMN     "otherDocuments" TEXT,
ADD COLUMN     "registeredAs" TEXT,
ADD COLUMN     "registeredAsDescription" TEXT,
ALTER COLUMN "price" DROP NOT NULL;
