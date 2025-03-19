/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `company` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `work_order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "company" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "work_order" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "company_id_key" ON "company"("id");
