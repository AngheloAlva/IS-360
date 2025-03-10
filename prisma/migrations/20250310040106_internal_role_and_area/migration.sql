/*
  Warnings:

  - You are about to drop the column `preventionOfficer` on the `work_permit` table. All the data in the column will be lost.
  - Added the required column `prevention_officer_id` to the `work_permit` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OTC_INTERNAL_ROLE" AS ENUM ('GENERAL_SUPERVISOR', 'AREA_SUPERVISOR', 'PREVENTION_OFFICER', 'OPERATIONS_MANAGER', 'MAINTENANCE_SUPERVISOR', 'ENVIRONMENTAL_SUPERVISOR', 'QUALITY_SUPERVISOR', 'NONE');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "area" "AREAS",
ADD COLUMN     "internalRole" "OTC_INTERNAL_ROLE" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "work_permit" DROP COLUMN "preventionOfficer",
ADD COLUMN     "prevention_officer_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "work_permit_prevention_officer_id_idx" ON "work_permit"("prevention_officer_id");

-- AddForeignKey
ALTER TABLE "work_permit" ADD CONSTRAINT "work_permit_prevention_officer_id_fkey" FOREIGN KEY ("prevention_officer_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
