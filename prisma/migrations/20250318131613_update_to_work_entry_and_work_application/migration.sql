/*
  Warnings:

  - You are about to drop the column `aditionalActivityId` on the `attachment` table. All the data in the column will be lost.
  - You are about to drop the column `dailyActivityId` on the `attachment` table. All the data in the column will be lost.
  - You are about to drop the column `otcInspectionId` on the `attachment` table. All the data in the column will be lost.
  - You are about to drop the column `prevention_officer_id` on the `work_permit` table. All the data in the column will be lost.
  - You are about to drop the `aditional_activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `otc_inspection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `personnel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `prevention_area` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `preventionOfficer` to the `work_permit` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WORK_APPLICATION_STATUS" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ENTRY_TYPE" AS ENUM ('DAILY_ACTIVITY', 'ADDITIONAL_ACTIVITY', 'PREVENTION_AREA', 'OTC_INSPECTION', 'COMMENT', 'USER_NOTE');

-- CreateEnum
CREATE TYPE "NOTE_STATUS" AS ENUM ('PENDING', 'ACKNOWLEDGED', 'RESOLVED');

-- AlterEnum
ALTER TYPE "USER_ROLE" ADD VALUE 'OPERATOR';

-- DropForeignKey
ALTER TABLE "aditional_activity" DROP CONSTRAINT "aditional_activity_workBookId_fkey";

-- DropForeignKey
ALTER TABLE "attachment" DROP CONSTRAINT "attachment_aditionalActivityId_fkey";

-- DropForeignKey
ALTER TABLE "attachment" DROP CONSTRAINT "attachment_dailyActivityId_fkey";

-- DropForeignKey
ALTER TABLE "attachment" DROP CONSTRAINT "attachment_otcInspectionId_fkey";

-- DropForeignKey
ALTER TABLE "attachment" DROP CONSTRAINT "attachment_workTrackerId_fkey";

-- DropForeignKey
ALTER TABLE "daily_activity" DROP CONSTRAINT "daily_activity_workBookId_fkey";

-- DropForeignKey
ALTER TABLE "otc_inspection" DROP CONSTRAINT "otc_inspection_workBookId_fkey";

-- DropForeignKey
ALTER TABLE "personnel" DROP CONSTRAINT "personnel_dailyActivityId_fkey";

-- DropForeignKey
ALTER TABLE "personnel" DROP CONSTRAINT "personnel_workPermitId_fkey";

-- DropForeignKey
ALTER TABLE "prevention_area" DROP CONSTRAINT "prevention_area_workBookId_fkey";

-- DropForeignKey
ALTER TABLE "work_permit" DROP CONSTRAINT "work_permit_prevention_officer_id_fkey";

-- DropIndex
DROP INDEX "work_permit_prevention_officer_id_idx";

-- AlterTable
ALTER TABLE "attachment" DROP COLUMN "aditionalActivityId",
DROP COLUMN "dailyActivityId",
DROP COLUMN "otcInspectionId",
ADD COLUMN     "workApplicationId" TEXT,
ADD COLUMN     "workBookEntryId" TEXT,
ALTER COLUMN "workTrackerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "work_permit" DROP COLUMN "prevention_officer_id",
ADD COLUMN     "preventionOfficer" TEXT NOT NULL;

-- DropTable
DROP TABLE "aditional_activity";

-- DropTable
DROP TABLE "daily_activity";

-- DropTable
DROP TABLE "otc_inspection";

-- DropTable
DROP TABLE "personnel";

-- DropTable
DROP TABLE "prevention_area";

-- CreateTable
CREATE TABLE "work_application" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" "WORK_APPLICATION_STATUS" NOT NULL DEFAULT 'PENDING',
    "criticality" TEXT NOT NULL,
    "responsibleId" TEXT NOT NULL,

    CONSTRAINT "work_application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_book_entry" (
    "id" TEXT NOT NULL,
    "entryType" "ENTRY_TYPE" NOT NULL,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "hasAttachments" BOOLEAN NOT NULL DEFAULT false,
    "executionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activityName" TEXT,
    "activityStartTime" TEXT,
    "activityEndTime" TEXT,
    "supervisionComments" TEXT,
    "safetyObservations" TEXT,
    "nonConformities" TEXT,
    "inspectorName" TEXT,
    "recommendations" TEXT,
    "others" TEXT,
    "preventionName" TEXT,
    "noteStatus" "NOTE_STATUS" DEFAULT 'PENDING',
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3),
    "signedById" TEXT,
    "workBookId" TEXT NOT NULL,
    "referencedEntryId" TEXT,

    CONSTRAINT "work_book_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AssignedUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AssignedUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ReportedUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ReportedUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_WorkPermitParticipants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_WorkPermitParticipants_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "work_application_id_key" ON "work_application"("id");

-- CreateIndex
CREATE INDEX "work_book_entry_workBookId_createdAt_idx" ON "work_book_entry"("workBookId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "work_book_entry_id_key" ON "work_book_entry"("id");

-- CreateIndex
CREATE INDEX "_AssignedUsers_B_index" ON "_AssignedUsers"("B");

-- CreateIndex
CREATE INDEX "_ReportedUsers_B_index" ON "_ReportedUsers"("B");

-- CreateIndex
CREATE INDEX "_WorkPermitParticipants_B_index" ON "_WorkPermitParticipants"("B");

-- CreateIndex
CREATE INDEX "work_permit_preventionOfficer_idx" ON "work_permit"("preventionOfficer");

-- AddForeignKey
ALTER TABLE "work_application" ADD CONSTRAINT "work_application_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_book_entry" ADD CONSTRAINT "work_book_entry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_book_entry" ADD CONSTRAINT "work_book_entry_signedById_fkey" FOREIGN KEY ("signedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_book_entry" ADD CONSTRAINT "work_book_entry_workBookId_fkey" FOREIGN KEY ("workBookId") REFERENCES "work_book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_book_entry" ADD CONSTRAINT "work_book_entry_referencedEntryId_fkey" FOREIGN KEY ("referencedEntryId") REFERENCES "work_book_entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_workApplicationId_fkey" FOREIGN KEY ("workApplicationId") REFERENCES "work_application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_workBookEntryId_fkey" FOREIGN KEY ("workBookEntryId") REFERENCES "work_book_entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_workTrackerId_fkey" FOREIGN KEY ("workTrackerId") REFERENCES "work_tracker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_permit" ADD CONSTRAINT "work_permit_preventionOfficer_fkey" FOREIGN KEY ("preventionOfficer") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignedUsers" ADD CONSTRAINT "_AssignedUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignedUsers" ADD CONSTRAINT "_AssignedUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "work_book_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReportedUsers" ADD CONSTRAINT "_ReportedUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReportedUsers" ADD CONSTRAINT "_ReportedUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "work_book_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkPermitParticipants" ADD CONSTRAINT "_WorkPermitParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkPermitParticipants" ADD CONSTRAINT "_WorkPermitParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "work_permit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
