/*
  Warnings:

  - You are about to drop the column `name` on the `personnel` table. All the data in the column will be lost.
  - You are about to drop the column `otNumber` on the `work_book` table. All the data in the column will be lost.
  - You are about to drop the column `otNumber` on the `work_permit` table. All the data in the column will be lost.
  - You are about to drop the column `otNumber` on the `work_tracker` table. All the data in the column will be lost.
  - You are about to drop the `participants_in_permit` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug,parentId,userId]` on the table `folder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `folder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `personnel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otNumberId` to the `work_book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otNumberId` to the `work_permit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otNumberId` to the `work_tracker` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WORK_ORDER_STATUS" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SAFETY_TALK_TYPE" AS ENUM ('IRL', 'ENVIRONMENTAL');

-- CreateEnum
CREATE TYPE "RESOURCE_TYPE" AS ENUM ('VIDEO', 'PRESENTATION', 'DOCUMENT');

-- DropForeignKey
ALTER TABLE "participants_in_permit" DROP CONSTRAINT "participants_in_permit_workPermitId_fkey";

-- DropForeignKey
ALTER TABLE "personnel" DROP CONSTRAINT "personnel_dailyActivityId_fkey";

-- DropIndex
DROP INDEX "work_book_otNumber_key";

-- AlterTable
ALTER TABLE "folder" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "personnel" DROP COLUMN "name",
ADD COLUMN     "company" TEXT,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "number" INTEGER,
ADD COLUMN     "workPermitId" TEXT,
ALTER COLUMN "position" DROP NOT NULL,
ALTER COLUMN "dailyActivityId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "work_book" DROP COLUMN "otNumber",
ADD COLUMN     "otNumberId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "work_permit" DROP COLUMN "otNumber",
ADD COLUMN     "otNumberId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "work_tracker" DROP COLUMN "otNumber",
ADD COLUMN     "otNumberId" TEXT NOT NULL;

-- DropTable
DROP TABLE "participants_in_permit";

-- CreateTable
CREATE TABLE "work_order" (
    "id" TEXT NOT NULL,
    "otNumber" TEXT NOT NULL,
    "initDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "quantityDays" INTEGER NOT NULL,
    "equipmentProperty" TEXT NOT NULL,
    "status" "WORK_ORDER_STATUS" NOT NULL DEFAULT 'PENDING',
    "estimatedDuration" INTEGER NOT NULL,
    "printed" BOOLEAN NOT NULL,
    "type" TEXT NOT NULL,
    "contractCompany" TEXT NOT NULL,
    "responsibleId" TEXT NOT NULL,

    CONSTRAINT "work_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_talk" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "SAFETY_TALK_TYPE" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_talk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_talk_resource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "RESOURCE_TYPE" NOT NULL,
    "url" TEXT NOT NULL,
    "downloadUrl" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "order" INTEGER NOT NULL,
    "safetyTalkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_talk_resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "safetyTalkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_option" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_safety_talk" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "safetyTalkId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_safety_talk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_safety_talk_answer" (
    "id" TEXT NOT NULL,
    "userSafetyTalkId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_safety_talk_answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "work_order_id_key" ON "work_order"("id");

-- CreateIndex
CREATE UNIQUE INDEX "work_order_otNumber_key" ON "work_order"("otNumber");

-- CreateIndex
CREATE UNIQUE INDEX "folder_slug_parentId_userId_key" ON "folder"("slug", "parentId", "userId");

-- AddForeignKey
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_book" ADD CONSTRAINT "work_book_otNumberId_fkey" FOREIGN KEY ("otNumberId") REFERENCES "work_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel" ADD CONSTRAINT "personnel_dailyActivityId_fkey" FOREIGN KEY ("dailyActivityId") REFERENCES "daily_activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel" ADD CONSTRAINT "personnel_workPermitId_fkey" FOREIGN KEY ("workPermitId") REFERENCES "work_permit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_tracker" ADD CONSTRAINT "work_tracker_otNumberId_fkey" FOREIGN KEY ("otNumberId") REFERENCES "work_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_permit" ADD CONSTRAINT "work_permit_otNumberId_fkey" FOREIGN KEY ("otNumberId") REFERENCES "work_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_talk_resource" ADD CONSTRAINT "safety_talk_resource_safetyTalkId_fkey" FOREIGN KEY ("safetyTalkId") REFERENCES "safety_talk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_safetyTalkId_fkey" FOREIGN KEY ("safetyTalkId") REFERENCES "safety_talk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_option" ADD CONSTRAINT "question_option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_safety_talk" ADD CONSTRAINT "user_safety_talk_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_safety_talk" ADD CONSTRAINT "user_safety_talk_safetyTalkId_fkey" FOREIGN KEY ("safetyTalkId") REFERENCES "safety_talk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_safety_talk_answer" ADD CONSTRAINT "user_safety_talk_answer_userSafetyTalkId_fkey" FOREIGN KEY ("userSafetyTalkId") REFERENCES "user_safety_talk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_safety_talk_answer" ADD CONSTRAINT "user_safety_talk_answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_safety_talk_answer" ADD CONSTRAINT "user_safety_talk_answer_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "question_option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
