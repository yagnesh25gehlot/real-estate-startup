-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "buildingName" TEXT,
ADD COLUMN     "city" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "complexName" TEXT,
ADD COLUMN     "flatNumber" TEXT,
ADD COLUMN     "landmark" TEXT,
ADD COLUMN     "locality" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "pincode" TEXT,
ADD COLUMN     "plotNumber" TEXT,
ADD COLUMN     "shopNumber" TEXT,
ADD COLUMN     "state" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "street" TEXT,
ADD COLUMN     "subRegion" TEXT,
ALTER COLUMN "address" DROP NOT NULL;
