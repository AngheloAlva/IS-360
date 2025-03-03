-- AlterTable
ALTER TABLE "aditional_activity" ALTER COLUMN "comments" DROP NOT NULL;

-- AlterTable
ALTER TABLE "daily_activity" ALTER COLUMN "comments" DROP NOT NULL;

-- AlterTable
ALTER TABLE "otc_inspection" ALTER COLUMN "nonConformities" DROP NOT NULL;

-- AlterTable
ALTER TABLE "prevention_area" ALTER COLUMN "recommendations" DROP NOT NULL,
ALTER COLUMN "others" DROP NOT NULL;
