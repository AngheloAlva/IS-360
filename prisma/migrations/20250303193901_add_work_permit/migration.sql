-- CreateTable
CREATE TABLE "work_permit" (
    "id" TEXT NOT NULL,
    "otNumber" TEXT NOT NULL,
    "aplicantPt" TEXT NOT NULL,
    "responsiblePt" TEXT NOT NULL,
    "executanCompany" TEXT NOT NULL,
    "mutuality" TEXT NOT NULL,
    "initDate" TIMESTAMP(3) NOT NULL,
    "hour" TEXT NOT NULL,
    "workersNumber" INTEGER NOT NULL,
    "workDescription" TEXT NOT NULL,
    "exactPlace" TEXT NOT NULL,
    "workWillBe" TEXT NOT NULL,
    "workWillBeOther" TEXT,
    "tools" TEXT[],
    "otherTools" TEXT,
    "preChecks" TEXT[],
    "otherPreChecks" TEXT,
    "activityDetails" TEXT[],
    "riskIdentification" TEXT[],
    "otherRisk" TEXT,
    "preventiveControlMeasures" TEXT[],
    "otherPreventiveControlMeasures" TEXT,
    "generateWaste" BOOLEAN NOT NULL,
    "wasteType" TEXT NOT NULL,
    "wasteDisposalLocation" TEXT NOT NULL,
    "whoDeliversWorkAreaOp" TEXT NOT NULL,
    "workerExecutor" TEXT NOT NULL,
    "preventionOfficer" TEXT NOT NULL,
    "whoReceives" TEXT NOT NULL,
    "cleanAndTidyWorkArea" BOOLEAN NOT NULL,
    "workCompleted" BOOLEAN NOT NULL,
    "observations" TEXT,
    "additionalObservations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "work_permit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants_in_permit" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "workPermitId" TEXT NOT NULL,

    CONSTRAINT "participants_in_permit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "work_permit" ADD CONSTRAINT "work_permit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants_in_permit" ADD CONSTRAINT "participants_in_permit_workPermitId_fkey" FOREIGN KEY ("workPermitId") REFERENCES "work_permit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
