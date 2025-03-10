-- AlterTable
ALTER TABLE "work_permit" ADD COLUMN     "acceptTerms" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "whoReceives" DROP NOT NULL,
ALTER COLUMN "cleanAndTidyWorkArea" DROP NOT NULL,
ALTER COLUMN "workCompleted" DROP NOT NULL;
