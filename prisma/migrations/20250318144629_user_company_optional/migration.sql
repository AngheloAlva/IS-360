-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_companyId_fkey";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "companyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
