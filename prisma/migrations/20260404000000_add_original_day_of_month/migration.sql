-- AlterTable
ALTER TABLE "maintenance_plan_task" ADD COLUMN "originalDayOfMonth" INTEGER;
ALTER TABLE "maintenance_plan_task" ADD COLUMN "automatedEstimatedDaysByMonth" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: extract day of month from nextDate for existing tasks
UPDATE "maintenance_plan_task" SET "originalDayOfMonth" = EXTRACT(DAY FROM "nextDate")::INTEGER WHERE "originalDayOfMonth" IS NULL;
