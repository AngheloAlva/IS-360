/*
  Warnings:

  - You are about to drop the column `otNumber` on the `aditional_activity` table. All the data in the column will be lost.
  - You are about to drop the column `otNumber` on the `otc_inspection` table. All the data in the column will be lost.
  - You are about to drop the column `otNumber` on the `prevention_area` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "aditional_activity" DROP COLUMN "otNumber";

-- AlterTable
ALTER TABLE "otc_inspection" DROP COLUMN "otNumber";

-- AlterTable
ALTER TABLE "prevention_area" DROP COLUMN "otNumber";
