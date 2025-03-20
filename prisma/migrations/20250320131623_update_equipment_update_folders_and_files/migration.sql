/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `equipment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[barcode]` on the table `equipment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `barcode` to the `equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `equipment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "equipment" ADD COLUMN     "barcode" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isOperational" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "file" ADD COLUMN     "isExternal" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "folder" ADD COLUMN     "color" TEXT NOT NULL DEFAULT 'oklch(.795 .184 86.047)',
ADD COLUMN     "isExternal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'default';

-- AlterTable
ALTER TABLE "work_order" ALTER COLUMN "breakDays" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "equipment_id_key" ON "equipment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_barcode_key" ON "equipment"("barcode");
