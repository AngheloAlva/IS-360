/*
  Warnings:

  - You are about to drop the column `contractCompany` on the `work_order` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `work_order` table. All the data in the column will be lost.
  - You are about to drop the column `equipmentProperty` on the `work_order` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedDuration` on the `work_order` table. All the data in the column will be lost.
  - You are about to drop the column `initDate` on the `work_order` table. All the data in the column will be lost.
  - You are about to drop the column `printed` on the `work_order` table. All the data in the column will be lost.
  - You are about to drop the column `quantityDays` on the `work_order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[initReportId]` on the table `attachment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[endReportId]` on the table `attachment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[initReportId]` on the table `work_order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[endReportId]` on the table `work_order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `work_book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `breakDays` to the `work_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `work_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estimatedDays` to the `work_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estimatedHours` to the `work_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priority` to the `work_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `programDate` to the `work_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requiresBreak` to the `work_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `solicitationDate` to the `work_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `solicitationTime` to the `work_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supervisorId` to the `work_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workDescription` to the `work_order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workRequest` to the `work_order` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `work_order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "WORK_ORDER_TYPE" AS ENUM ('CORRECTIVE', 'PREVENTIVE', 'PREDICTIVE');

-- CreateEnum
CREATE TYPE "WORK_ORDER_PRIORITY" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- AlterTable
ALTER TABLE "attachment" ADD COLUMN     "endReportId" TEXT,
ADD COLUMN     "initReportId" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "isSupervisor" BOOLEAN,
ADD COLUMN     "progress" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "work_book" ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "work_order" DROP COLUMN "contractCompany",
DROP COLUMN "endDate",
DROP COLUMN "equipmentProperty",
DROP COLUMN "estimatedDuration",
DROP COLUMN "initDate",
DROP COLUMN "printed",
DROP COLUMN "quantityDays",
ADD COLUMN     "breakDays" INTEGER NOT NULL,
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "endReportId" TEXT,
ADD COLUMN     "estimatedDays" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "estimatedEndDate" TIMESTAMP(3),
ADD COLUMN     "estimatedHours" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "initReportId" TEXT,
ADD COLUMN     "priority" "WORK_ORDER_PRIORITY" NOT NULL,
ADD COLUMN     "programDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "requiresBreak" BOOLEAN NOT NULL,
ADD COLUMN     "solicitationDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "solicitationTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "supervisorId" TEXT NOT NULL,
ADD COLUMN     "workDescription" TEXT NOT NULL,
ADD COLUMN     "workRequest" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "WORK_ORDER_TYPE" NOT NULL;

-- CreateTable
CREATE TABLE "equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marco_work_book" (
    "id" TEXT NOT NULL,
    "contractingCompany" TEXT NOT NULL,
    "workResponsibleName" TEXT NOT NULL,
    "workResponsiblePhone" TEXT NOT NULL,
    "otcInspectorName" TEXT NOT NULL,
    "otcInspectorPhone" TEXT NOT NULL,
    "workName" TEXT NOT NULL,
    "workLocation" TEXT NOT NULL,
    "workType" TEXT NOT NULL,
    "workStartDate" TIMESTAMP(3) NOT NULL,
    "workEstimatedEndDate" TIMESTAMP(3) NOT NULL,
    "workStatus" TEXT NOT NULL,
    "workProgressStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "marco_work_book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EquipmentToWorkOrder" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EquipmentToWorkOrder_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_MarcoWorkBookToWorkOrder" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MarcoWorkBookToWorkOrder_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_MarcoWorkBookToWorkBookEntry" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MarcoWorkBookToWorkBookEntry_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "marco_work_book_id_key" ON "marco_work_book"("id");

-- CreateIndex
CREATE INDEX "_EquipmentToWorkOrder_B_index" ON "_EquipmentToWorkOrder"("B");

-- CreateIndex
CREATE INDEX "_MarcoWorkBookToWorkOrder_B_index" ON "_MarcoWorkBookToWorkOrder"("B");

-- CreateIndex
CREATE INDEX "_MarcoWorkBookToWorkBookEntry_B_index" ON "_MarcoWorkBookToWorkBookEntry"("B");

-- CreateIndex
CREATE UNIQUE INDEX "attachment_initReportId_key" ON "attachment"("initReportId");

-- CreateIndex
CREATE UNIQUE INDEX "attachment_endReportId_key" ON "attachment"("endReportId");

-- CreateIndex
CREATE UNIQUE INDEX "work_order_initReportId_key" ON "work_order"("initReportId");

-- CreateIndex
CREATE UNIQUE INDEX "work_order_endReportId_key" ON "work_order"("endReportId");

-- AddForeignKey
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_initReportId_fkey" FOREIGN KEY ("initReportId") REFERENCES "attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_endReportId_fkey" FOREIGN KEY ("endReportId") REFERENCES "attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_book" ADD CONSTRAINT "work_book_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marco_work_book" ADD CONSTRAINT "marco_work_book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marco_work_book" ADD CONSTRAINT "marco_work_book_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EquipmentToWorkOrder" ADD CONSTRAINT "_EquipmentToWorkOrder_A_fkey" FOREIGN KEY ("A") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EquipmentToWorkOrder" ADD CONSTRAINT "_EquipmentToWorkOrder_B_fkey" FOREIGN KEY ("B") REFERENCES "work_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MarcoWorkBookToWorkOrder" ADD CONSTRAINT "_MarcoWorkBookToWorkOrder_A_fkey" FOREIGN KEY ("A") REFERENCES "marco_work_book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MarcoWorkBookToWorkOrder" ADD CONSTRAINT "_MarcoWorkBookToWorkOrder_B_fkey" FOREIGN KEY ("B") REFERENCES "work_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MarcoWorkBookToWorkBookEntry" ADD CONSTRAINT "_MarcoWorkBookToWorkBookEntry_A_fkey" FOREIGN KEY ("A") REFERENCES "marco_work_book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MarcoWorkBookToWorkBookEntry" ADD CONSTRAINT "_MarcoWorkBookToWorkBookEntry_B_fkey" FOREIGN KEY ("B") REFERENCES "work_book_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
