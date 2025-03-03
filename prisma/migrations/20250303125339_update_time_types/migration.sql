-- AlterTable
ALTER TABLE "aditional_activity" ALTER COLUMN "activityStartTime" SET DATA TYPE TEXT,
ALTER COLUMN "activityEndTime" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "daily_activity" ALTER COLUMN "activityStartTime" SET DATA TYPE TEXT,
ALTER COLUMN "activityEndTime" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "otc_inspection" ALTER COLUMN "activityStartTime" SET DATA TYPE TEXT,
ALTER COLUMN "activityEndTime" SET DATA TYPE TEXT;
