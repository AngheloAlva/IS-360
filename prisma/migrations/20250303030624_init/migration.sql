-- CreateEnum
CREATE TYPE "USER_ROLE" AS ENUM ('SUPERADMIN', 'ADMIN', 'USER', 'PARTNER_COMPANY');

-- CreateEnum
CREATE TYPE "AREAS" AS ENUM ('OPERATIONS', 'INSTRUCTIONS', 'INTEGRITY_AND_MAINTENANCE', 'ENVIRONMENT', 'RISK_PREVENTION', 'QUALITY_AND_PROFESSIONAL_EXCELLENCE', 'HSEQ', 'LEGAL', 'COMMUNITIES');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "USER_ROLE" NOT NULL DEFAULT 'PARTNER_COMPANY',
    "banned" BOOLEAN,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),
    "rut" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "impersonatedBy" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_book" (
    "id" TEXT NOT NULL,
    "otNumber" TEXT NOT NULL,
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

    CONSTRAINT "work_book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_activity" (
    "id" TEXT NOT NULL,
    "comments" TEXT NOT NULL,
    "executionDate" TIMESTAMP(3) NOT NULL,
    "activityStartTime" TIMESTAMP(3) NOT NULL,
    "activityEndTime" TIMESTAMP(3) NOT NULL,
    "activityName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workBookId" TEXT NOT NULL,

    CONSTRAINT "daily_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "rut" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "dailyActivityId" TEXT NOT NULL,

    CONSTRAINT "personnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aditional_activity" (
    "id" TEXT NOT NULL,
    "otNumber" TEXT NOT NULL,
    "comments" TEXT NOT NULL,
    "executionDate" TIMESTAMP(3) NOT NULL,
    "activityStartTime" TIMESTAMP(3) NOT NULL,
    "activityEndTime" TIMESTAMP(3) NOT NULL,
    "activityName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workBookId" TEXT NOT NULL,

    CONSTRAINT "aditional_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otc_inspection" (
    "id" TEXT NOT NULL,
    "otNumber" TEXT NOT NULL,
    "inspectorName" TEXT NOT NULL,
    "dateOfExecution" TIMESTAMP(3) NOT NULL,
    "activityStartTime" TIMESTAMP(3) NOT NULL,
    "activityEndTime" TIMESTAMP(3) NOT NULL,
    "supervisionComments" TEXT NOT NULL,
    "safetyObservations" TEXT NOT NULL,
    "nonConformities" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workBookId" TEXT NOT NULL,

    CONSTRAINT "otc_inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prevention_area" (
    "id" TEXT NOT NULL,
    "otNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    "others" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workBookId" TEXT NOT NULL,

    CONSTRAINT "prevention_area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_tracker" (
    "id" TEXT NOT NULL,
    "otNumber" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dedicatedHours" INTEGER NOT NULL,
    "quantityPersons" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_tracker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "aditionalActivityId" TEXT NOT NULL,
    "dailyActivityId" TEXT NOT NULL,
    "otcInspectionId" TEXT NOT NULL,
    "workTrackerId" TEXT NOT NULL,

    CONSTRAINT "attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_rut_key" ON "user"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "work_book_id_key" ON "work_book"("id");

-- CreateIndex
CREATE UNIQUE INDEX "work_book_otNumber_key" ON "work_book"("otNumber");

-- CreateIndex
CREATE UNIQUE INDEX "daily_activity_id_key" ON "daily_activity"("id");

-- CreateIndex
CREATE UNIQUE INDEX "personnel_id_key" ON "personnel"("id");

-- CreateIndex
CREATE UNIQUE INDEX "aditional_activity_id_key" ON "aditional_activity"("id");

-- CreateIndex
CREATE UNIQUE INDEX "otc_inspection_id_key" ON "otc_inspection"("id");

-- CreateIndex
CREATE UNIQUE INDEX "prevention_area_id_key" ON "prevention_area"("id");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_book" ADD CONSTRAINT "work_book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_activity" ADD CONSTRAINT "daily_activity_workBookId_fkey" FOREIGN KEY ("workBookId") REFERENCES "work_book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel" ADD CONSTRAINT "personnel_dailyActivityId_fkey" FOREIGN KEY ("dailyActivityId") REFERENCES "daily_activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aditional_activity" ADD CONSTRAINT "aditional_activity_workBookId_fkey" FOREIGN KEY ("workBookId") REFERENCES "work_book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otc_inspection" ADD CONSTRAINT "otc_inspection_workBookId_fkey" FOREIGN KEY ("workBookId") REFERENCES "work_book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prevention_area" ADD CONSTRAINT "prevention_area_workBookId_fkey" FOREIGN KEY ("workBookId") REFERENCES "work_book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_tracker" ADD CONSTRAINT "work_tracker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_aditionalActivityId_fkey" FOREIGN KEY ("aditionalActivityId") REFERENCES "aditional_activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_dailyActivityId_fkey" FOREIGN KEY ("dailyActivityId") REFERENCES "daily_activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_otcInspectionId_fkey" FOREIGN KEY ("otcInspectionId") REFERENCES "otc_inspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_workTrackerId_fkey" FOREIGN KEY ("workTrackerId") REFERENCES "work_tracker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
