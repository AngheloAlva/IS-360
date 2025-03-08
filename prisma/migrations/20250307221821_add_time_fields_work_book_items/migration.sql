/*
  Warnings:

  - Added the required column `initialDate` to the `otc_inspection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initialTime` to the `otc_inspection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initialDate` to the `prevention_area` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initialTime` to the `prevention_area` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "otc_inspection" ADD COLUMN     "initialDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "initialTime" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "prevention_area" ADD COLUMN     "comments" TEXT,
ADD COLUMN     "initialDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "initialTime" TEXT NOT NULL;
