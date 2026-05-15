-- CreateEnum
CREATE TYPE "ACCESS_ROLE" AS ENUM ('ADMIN', 'PARTNER_COMPANY');

-- CreateEnum
CREATE TYPE "AREAS" AS ENUM ('OPERATIONS', 'INSTRUCTIONS', 'INTEGRITY_AND_MAINTENANCE', 'ENVIRONMENT', 'OPERATIONAL_SAFETY', 'QUALITY_AND_OPERATIONAL_EXCELLENCE', 'REGULATORY_COMPLIANCE', 'LEGAL', 'COMMUNITIES', 'PROJECTS', 'PURCHASING', 'ADMINISTRATION_AND_FINANCES', 'IT', 'GERENCY', 'DOCUMENTARY_LIBRARY');

-- CreateEnum
CREATE TYPE "MODULES" AS ENUM ('ALL', 'EQUIPMENT', 'SAFETY_TALK', 'WORK_ORDERS', 'WORK_PERMITS', 'DOCUMENTATION', 'WORK_REQUESTS', 'COMPANY', 'USERS', 'MAINTENANCE_PLANS', 'STARTUP_FOLDERS', 'VEHICLES', 'CONTACT', 'NONE');

-- CreateEnum
CREATE TYPE "VEHICLE_TYPE" AS ENUM ('CAR', 'TRUCK', 'MOTORCYCLE', 'BUS', 'TRACTOR', 'TRAILER', 'OTHER', 'VAN');

-- CreateEnum
CREATE TYPE "WORK_ORDER_STATUS" AS ENUM ('PLANNED', 'PENDING', 'COMPLETED', 'CANCELLED', 'IN_PROGRESS', 'CLOSURE_REQUESTED');

-- CreateEnum
CREATE TYPE "WORK_ORDER_TYPE" AS ENUM ('CORRECTIVE', 'PREVENTIVE', 'PREDICTIVE', 'PROACTIVE');

-- CreateEnum
CREATE TYPE "WORK_ORDER_CAPEX" AS ENUM ('CONFIDABILITY', 'MITIGATE_RISK', 'COMPLIANCE');

-- CreateEnum
CREATE TYPE "WORK_ORDER_PRIORITY" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "MILESTONE_STATUS" AS ENUM ('PENDING', 'COMPLETED', 'IN_PROGRESS', 'REQUESTED_CLOSURE');

-- CreateEnum
CREATE TYPE "CRITICALITY" AS ENUM ('CRITICAL', 'SEMICRITICAL', 'UNCITICAL');

-- CreateEnum
CREATE TYPE "WORK_APPLICATION_STATUS" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ENTRY_TYPE" AS ENUM ('COMMENT', 'OTC_INSPECTION', 'DAILY_ACTIVITY', 'ADDITIONAL_ACTIVITY');

-- CreateEnum
CREATE TYPE "INSPECTION_STATUS" AS ENUM ('REPORTED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "WORK_PERMIT_STATUS" AS ENUM ('ACTIVE', 'REJECTED', 'COMPLETED', 'REVIEW_PENDING');

-- CreateEnum
CREATE TYPE "SAFETY_TALK_CATEGORY" AS ENUM ('ENVIRONMENT', 'IRL');

-- CreateEnum
CREATE TYPE "SAFETY_TALK_STATUS" AS ENUM ('PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'BLOCKED', 'MANUALLY_APPROVED');

-- CreateEnum
CREATE TYPE "PLAN_FREQUENCY" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'FOURMONTHLY', 'BIANNUAL', 'YEARLY');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'EXPIRED', 'TO_UPDATE');

-- CreateEnum
CREATE TYPE "SafetyAndHealthDocumentType" AS ENUM ('COMPANY_INFO', 'STAFF_LIST', 'GANTT_CHART', 'MUTUAL', 'INTERNAL_REGULATION', 'ACCIDENT_RATE', 'RISK_MATRIX', 'PREVENTION_PLAN', 'WORK_PROCEDURE', 'EMERGENCY_PROCEDURE', 'TOOLS_MAINTENANCE', 'PPE_CERTIFICATION', 'HARASSMENT_PROCEDURE', 'ORGANIZATION_CHART', 'SAFE_WORK', 'RISK_ANALYSIS', 'WORK_PERMIT');

-- CreateEnum
CREATE TYPE "WorkerDocumentType" AS ENUM ('CONTRACT', 'INTERNAL_REGULATION_RECEIPT', 'RISK_INFORMATION', 'ID_CARD', 'DRIVING_LICENSE', 'HEALTH_EXAM', 'PSYCHOTECHNICAL_EXAM', 'RISK_MATRIX_TRAINING', 'WORK_PROCEDURE_TRAINING', 'EMERGENCY_PROCEDURE_TRAINING', 'DEFENSIVE_DRIVING_TRAINING', 'MOUNTAIN_DEFENSIVE_DRIVING', 'TOOLS_MAINTENANCE_TRAINING', 'HARASSMENT_TRAINING', 'PPE_RECEIPT', 'PREVENTION_EXPERT', 'HIGH_RISK_TRAINING', 'ENVIRONMENTAL_TRAINING', 'ALCOHOL_AND_DRUGS_EXAM');

-- CreateEnum
CREATE TYPE "VehicleDocumentType" AS ENUM ('EQUIPMENT_FILE', 'VEHICLE_REGISTRATION', 'CIRCULATION_PERMIT', 'TECHNICAL_REVIEW', 'INSURANCE', 'CHECKLIST', 'TRANSPORTATION_TO_OTC', 'HAZARDOUS_WASTE_TRANSPORT', 'NON_HAZARDOUS_WASTE_TRANSPORT', 'LIQUID_WASTE_TRANSPORT');

-- CreateEnum
CREATE TYPE "EnvironmentalDocType" AS ENUM ('ENVIRONMENTAL_PLAN', 'SPILL_PREVENTION', 'WASTE_MANAGEMENT', 'ENVIRONMENTAL_TRAINING', 'ENVIRONMENTAL_MATRIX', 'RECT_CERTIFICATE', 'WATER_CERTIFICATE', 'WATER_FACTORY_RESOLUTION', 'DINING_RESOLUTION', 'CHEMICAL_TOILET_CONTRACT', 'SAFETY_DATA_SHEET', 'LAYOUT_PLAN', 'ELECTRICAL_DECLARATION', 'GAS_DECLARATION', 'PEST_CONTROL_RESOLUTION', 'PEST_CONTROL_CERTIFICATE', 'PEST_CONTROL_PRODUCTS_SDS', 'PEST_CONTROL_TRACKING', 'HAZARDOUS_STORAGE_CHECKLIST', 'HAZARDOUS_INVENTORY', 'LAND_MOVEMENT_PERMIT', 'DEBRIS_ROUTE', 'FUEL_CONSUMPTION', 'WATER_CONSUMPTION', 'OTHER');

-- CreateEnum
CREATE TYPE "EnvironmentDocType" AS ENUM ('WORK_PROCEDURE', 'ENVIRONMENTAL_ASPECTS_AND_IMPACTS_MATRIX', 'SAFETY_DATA_SHEET_FOR_CHEMICALS', 'WORKER_TRAINING_RECORD', 'HEALTH_RESOLUTION_FOR_WORKERS_DRINKING_WATER', 'HEALTH_RESOLUTION_FOR_THE_CHEMICAL_TOILET', 'RESOLUTION_FOR_THE_SITE_WHERE_DEBRIS_WILL_BE_DISPOSED', 'RESOLUTION_FOR_THE_DEBRIS_TRANSPORTER', 'DEBRIS_TRANSFER_ROUTE', 'HEALTH_RESOLUTION_FROM_THE_PEST_CONTROL_COMPANY', 'ENVIRONMENTAL_MANAGEMENT_PLAN');

-- CreateEnum
CREATE TYPE "BasicDocumentType" AS ENUM ('CONTRACT', 'INSURANCE', 'PPE_RECEIPT', 'SAFETY_AND_HEALTH_INFO');

-- CreateEnum
CREATE TYPE "TechSpecsDocumentType" AS ENUM ('GANTT_CHART', 'TECHNICAL_WORK_PROCEDURE');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('VEHICLES', 'PERSONNEL', 'ENVIRONMENTAL', 'ENVIRONMENT', 'SAFETY_AND_HEALTH', 'BASIC', 'TECHNICAL_SPECS');

-- CreateEnum
CREATE TYPE "StartupFolderType" AS ENUM ('BASIC', 'FULL');

-- CreateEnum
CREATE TYPE "StartupFolderStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "WORK_REQUEST_STATUS" AS ENUM ('REPORTED', 'APPROVED', 'ATTENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WORK_REQUEST_TYPE" AS ENUM ('MECHANIC', 'ELECTRIC');

-- CreateEnum
CREATE TYPE "ACTIVITY_TYPE" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'SUBMIT', 'APPROVE', 'REJECT', 'CANCEL', 'COMPLETE', 'VIEW', 'DOWNLOAD', 'UPLOAD', 'COMMENT', 'ASSIGN', 'UNASSIGN', 'LOGIN', 'LOGOUT');

-- CreateEnum
CREATE TYPE "INSPECTION_COMMENT_TYPE" AS ENUM ('SUPERVISOR_RESPONSE', 'RESPONSIBLE_APPROVAL', 'RESPONSIBLE_REJECTION');

-- CreateEnum
CREATE TYPE "VISITOR_TALK_STATUS" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT NOT NULL,
    "accessRole" "ACCESS_ROLE" NOT NULL DEFAULT 'PARTNER_COMPANY',
    "internalRole" TEXT,
    "area" "AREAS",
    "banned" BOOLEAN,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),
    "rut" TEXT NOT NULL,
    "twoFactorEnabled" BOOLEAN,
    "documentAreas" "AREAS"[] DEFAULT ARRAY[]::"AREAS"[],
    "internalArea" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT,
    "isSupervisor" BOOLEAN,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "targetRole" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "twoFactor" (
    "id" TEXT NOT NULL,
    "secret" TEXT,
    "backupCodes" TEXT,
    "userId" TEXT NOT NULL
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
CREATE TABLE "company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle" (
    "id" TEXT NOT NULL,
    "plate" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "brand" TEXT,
    "type" "VEHICLE_TYPE",
    "color" TEXT,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order" (
    "id" TEXT NOT NULL,
    "otNumber" TEXT NOT NULL,
    "type" "WORK_ORDER_TYPE" NOT NULL,
    "status" "WORK_ORDER_STATUS" NOT NULL DEFAULT 'PLANNED',
    "progress" DOUBLE PRECISION DEFAULT 0,
    "solicitationDate" TIMESTAMP(3) NOT NULL,
    "solicitationTime" TEXT NOT NULL,
    "workRequest" TEXT NOT NULL,
    "workDescription" TEXT,
    "priority" "WORK_ORDER_PRIORITY" NOT NULL,
    "capex" "WORK_ORDER_CAPEX",
    "programDate" TIMESTAMP(3) NOT NULL,
    "estimatedHours" DOUBLE PRECISION NOT NULL,
    "estimatedDays" DOUBLE PRECISION NOT NULL,
    "estimatedEndDate" TIMESTAMP(3) NOT NULL,
    "isWorkBookInit" BOOLEAN NOT NULL DEFAULT false,
    "workBookName" TEXT,
    "workBookLocation" TEXT,
    "workBookStartDate" TIMESTAMP(3),
    "companyId" TEXT,
    "supervisorId" TEXT NOT NULL,
    "responsibleId" TEXT NOT NULL,
    "initReportId" TEXT,
    "endReportId" TEXT,
    "closureRequestedById" TEXT,
    "closureRequestedAt" TIMESTAMP(3),
    "closureApprovedById" TEXT,
    "closureApprovedAt" TIMESTAMP(3),
    "closureRejectedReason" TEXT,
    "maintenancePlanTaskId" TEXT,
    "workRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "MILESTONE_STATUS" NOT NULL DEFAULT 'PENDING',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "weight" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "closureComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "requestedById" TEXT,
    "approvedById" TEXT,
    "workOrderId" TEXT NOT NULL,

    CONSTRAINT "milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "isOperational" BOOLEAN NOT NULL DEFAULT true,
    "type" TEXT,
    "tag" TEXT NOT NULL,
    "criticality" "CRITICALITY",
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentId" TEXT,
    "createdById" TEXT,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_book_entry" (
    "id" TEXT NOT NULL,
    "entryType" "ENTRY_TYPE" NOT NULL,
    "executionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activityName" TEXT,
    "activityStartTime" TEXT,
    "activityEndTime" TEXT,
    "comments" TEXT,
    "inspectionStatus" "INSPECTION_STATUS" DEFAULT 'REPORTED',
    "supervisionComments" TEXT,
    "safetyObservations" TEXT,
    "nonConformities" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "milestoneId" TEXT,

    CONSTRAINT "work_book_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workEntryId" TEXT,
    "initReportId" TEXT,
    "endReportId" TEXT,
    "maintenancePlanTaskId" TEXT,
    "equipmentId" TEXT,
    "workRequestId" TEXT,
    "inspectionCommentId" TEXT,

    CONSTRAINT "attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_permit" (
    "id" TEXT NOT NULL,
    "status" "WORK_PERMIT_STATUS" NOT NULL DEFAULT 'REVIEW_PENDING',
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "aplicantPt" TEXT NOT NULL,
    "mutuality" TEXT NOT NULL,
    "otherMutuality" TEXT,
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
    "wasteType" TEXT,
    "wasteDisposalLocation" TEXT,
    "whoDeliversWorkAreaOp" TEXT,
    "workerExecutor" TEXT,
    "workCompleted" BOOLEAN,
    "cleanAndTidyWorkArea" BOOLEAN,
    "additionalObservations" TEXT,
    "observations" TEXT,
    "acceptTerms" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "initialAreaMeasurement" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvalDate" TIMESTAMP(3),
    "approvalById" TEXT,
    "approvalNotes" TEXT,
    "closingDate" TIMESTAMP(3),
    "closingById" TEXT,
    "preventionOfficerId" TEXT,
    "otNumberId" TEXT,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "work_permit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_permit_attachment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT NOT NULL,
    "workPermitId" TEXT NOT NULL,

    CONSTRAINT "work_permit_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folder" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "root" BOOLEAN NOT NULL DEFAULT false,
    "area" "AREAS" NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'default',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "area" "AREAS",
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "revisionCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "folderId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_comment" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "file_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Counter" (
    "id" TEXT NOT NULL DEFAULT 'ot_counter',
    "value" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_request_counter" (
    "id" TEXT NOT NULL DEFAULT 'work_request_counter',
    "value" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "work_request_counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_talk_attempt" (
    "id" TEXT NOT NULL,
    "category" "SAFETY_TALK_CATEGORY" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "answers" JSONB NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "userSafetyTalkId" TEXT NOT NULL,

    CONSTRAINT "safety_talk_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_safety_talk" (
    "id" TEXT NOT NULL,
    "category" "SAFETY_TALK_CATEGORY" NOT NULL,
    "status" "SAFETY_TALK_STATUS" NOT NULL DEFAULT 'PENDING',
    "currentAttempts" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3),
    "nextAttemptAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "minRequiredScore" DOUBLE PRECISION NOT NULL DEFAULT 70.0,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "manuallyApproved" BOOLEAN NOT NULL DEFAULT false,
    "inPersonSessionDate" TIMESTAMP(3),
    "approvalById" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "user_safety_talk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachment_history" (
    "id" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,
    "previousUrl" TEXT NOT NULL,
    "previousName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "attachment_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_history" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "previousUrl" TEXT NOT NULL,
    "previousName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "file_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_history" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "changeType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workOrderId" TEXT,
    "workEntryId" TEXT,

    CONSTRAINT "equipment_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_plan" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "maintenance_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_plan_task" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "frequency" "PLAN_FREQUENCY" NOT NULL,
    "nextDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isAutomated" BOOLEAN NOT NULL DEFAULT false,
    "automatedCompanyId" TEXT,
    "automatedSupervisorId" TEXT,
    "automatedWorkOrderType" "WORK_ORDER_TYPE",
    "automatedPriority" "WORK_ORDER_PRIORITY",
    "automatedCapex" "WORK_ORDER_CAPEX",
    "automatedEstimatedDays" INTEGER,
    "automatedEstimatedHours" INTEGER,
    "automatedWorkDescription" TEXT,
    "equipmentId" TEXT NOT NULL,
    "maintenancePlanId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "maintenance_plan_task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startup_folder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Carpeta de arranque',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "StartupFolderType" NOT NULL DEFAULT 'FULL',
    "status" "StartupFolderStatus" NOT NULL DEFAULT 'PENDING',
    "moreMonthDuration" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "startup_folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_specs_folder" (
    "id" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "additionalNotificationEmails" TEXT[],
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewerId" TEXT,
    "startupFolderId" TEXT NOT NULL,

    CONSTRAINT "tech_specs_folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_specs_document" (
    "id" TEXT NOT NULL,
    "type" "TechSpecsDocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" "DocumentCategory" NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "reviewerId" TEXT,
    "uploadedById" TEXT,
    "folderId" TEXT NOT NULL,

    CONSTRAINT "tech_specs_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "basic_folder" (
    "id" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "additionalNotificationEmails" TEXT[],
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewerId" TEXT,
    "workerId" TEXT NOT NULL,
    "startupFolderId" TEXT NOT NULL,

    CONSTRAINT "basic_folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "basic_document" (
    "id" TEXT NOT NULL,
    "type" "BasicDocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" "DocumentCategory" NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "reviewerId" TEXT,
    "uploadedById" TEXT,
    "folderId" TEXT NOT NULL,

    CONSTRAINT "basic_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_and_health_folder" (
    "id" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "additionalNotificationEmails" TEXT[],
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewerId" TEXT,
    "startupFolderId" TEXT NOT NULL,

    CONSTRAINT "safety_and_health_folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_and_health_document" (
    "id" TEXT NOT NULL,
    "type" "SafetyAndHealthDocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" "DocumentCategory" NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "reviewerId" TEXT,
    "uploadedById" TEXT,
    "folderId" TEXT NOT NULL,

    CONSTRAINT "safety_and_health_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_folders" (
    "id" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "additionalNotificationEmails" TEXT[],
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDriver" BOOLEAN NOT NULL DEFAULT true,
    "reviewerId" TEXT,
    "workerId" TEXT NOT NULL,
    "startupFolderId" TEXT NOT NULL,

    CONSTRAINT "worker_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_document" (
    "id" TEXT NOT NULL,
    "type" "WorkerDocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" "DocumentCategory" NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "reviewerId" TEXT,
    "uploadedById" TEXT,
    "folderId" TEXT NOT NULL,

    CONSTRAINT "worker_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_folders" (
    "id" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "additionalNotificationEmails" TEXT[],
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "startupFolderId" TEXT NOT NULL,
    "reviewerId" TEXT,

    CONSTRAINT "vehicle_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_document" (
    "id" TEXT NOT NULL,
    "type" "VehicleDocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" "DocumentCategory" NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "reviewerId" TEXT,
    "uploadedById" TEXT,
    "folderId" TEXT NOT NULL,

    CONSTRAINT "vehicle_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environmental_folder" (
    "id" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "additionalNotificationEmails" TEXT[],
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewerId" TEXT,
    "startupFolderId" TEXT NOT NULL,

    CONSTRAINT "environmental_folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environmental_document" (
    "id" TEXT NOT NULL,
    "type" "EnvironmentalDocType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" "DocumentCategory" NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "reviewerId" TEXT,
    "uploadedById" TEXT,
    "folderId" TEXT NOT NULL,

    CONSTRAINT "environmental_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environment_folder" (
    "id" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "additionalNotificationEmails" TEXT[],
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewerId" TEXT,
    "startupFolderId" TEXT NOT NULL,

    CONSTRAINT "environment_folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environment_document" (
    "id" TEXT NOT NULL,
    "type" "EnvironmentDocType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" "DocumentCategory" NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "reviewerId" TEXT,
    "uploadedById" TEXT,
    "folderId" TEXT NOT NULL,

    CONSTRAINT "environment_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_request" (
    "id" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observations" TEXT,
    "customLocation" TEXT,
    "status" "WORK_REQUEST_STATUS" NOT NULL DEFAULT 'REPORTED',
    "operatorId" TEXT,
    "workType" "WORK_REQUEST_TYPE",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvalDate" TIMESTAMP(3),
    "approvalById" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "work_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_request_comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "workRequestId" TEXT NOT NULL,

    CONSTRAINT "work_request_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_log" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "module" "MODULES" NOT NULL,
    "action" "ACTIVITY_TYPE" NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "metadata" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "INSPECTION_COMMENT_TYPE" NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "workEntryId" TEXT NOT NULL,

    CONSTRAINT "inspection_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "emails" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "external_company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_visitor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "external_visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitor_talk" (
    "id" TEXT NOT NULL,
    "uniqueToken" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "visitor_talk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitor_talk_completion" (
    "id" TEXT NOT NULL,
    "status" "VISITOR_TALK_STATUS" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "visitorId" TEXT NOT NULL,
    "visitorTalkId" TEXT NOT NULL,

    CONSTRAINT "visitor_talk_completion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AssignedUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AssignedUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_WorkPermitParticipants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_WorkPermitParticipants_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EquipmentToWorkOrder" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EquipmentToWorkOrder_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EquipmentToWorkRequest" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EquipmentToWorkRequest_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_WorkOrderManualDocuments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_WorkOrderManualDocuments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ExternalVisitorToVisitorTalk" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ExternalVisitorToVisitorTalk_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "company_id_idx" ON "user"("companyId");

-- CreateIndex
CREATE INDEX "access_role_is_active_idx" ON "user"("accessRole", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_rut_key" ON "user"("rut");

-- CreateIndex
CREATE INDEX "notification_user_id_idx" ON "notification"("userId");

-- CreateIndex
CREATE INDEX "notification_is_read_idx" ON "notification"("isRead");

-- CreateIndex
CREATE INDEX "notification_target_role_idx" ON "notification"("targetRole");

-- CreateIndex
CREATE UNIQUE INDEX "twoFactor_id_key" ON "twoFactor"("id");

-- CreateIndex
CREATE UNIQUE INDEX "twoFactor_userId_key" ON "twoFactor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "company_rut_key" ON "company"("rut");

-- CreateIndex
CREATE INDEX "rut_idx" ON "company"("rut");

-- CreateIndex
CREATE INDEX "name_idx" ON "company"("name");

-- CreateIndex
CREATE INDEX "is_active_idx" ON "company"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "company_id_key" ON "company"("id");

-- CreateIndex
CREATE INDEX "vehicle_company_id_idx" ON "vehicle"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "work_order_initReportId_key" ON "work_order"("initReportId");

-- CreateIndex
CREATE UNIQUE INDEX "work_order_endReportId_key" ON "work_order"("endReportId");

-- CreateIndex
CREATE INDEX "status_idx" ON "work_order"("status");

-- CreateIndex
CREATE INDEX "ot_number_idx" ON "work_order"("otNumber");

-- CreateIndex
CREATE INDEX "company_status_idx" ON "work_order"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "work_order_id_key" ON "work_order"("id");

-- CreateIndex
CREATE UNIQUE INDEX "work_order_otNumber_key" ON "work_order"("otNumber");

-- CreateIndex
CREATE INDEX "milestone_workOrderId_order_idx" ON "milestone"("workOrderId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "milestone_id_key" ON "milestone"("id");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_id_key" ON "equipment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_tag_key" ON "equipment"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_barcode_key" ON "equipment"("barcode");

-- CreateIndex
CREATE INDEX "work_book_entry_milestoneId_idx" ON "work_book_entry"("milestoneId");

-- CreateIndex
CREATE INDEX "work_book_entry_workOrderId_createdAt_idx" ON "work_book_entry"("workOrderId", "createdAt");

-- CreateIndex
CREATE INDEX "work_book_entry_workOrderId_entryType_idx" ON "work_book_entry"("workOrderId", "entryType");

-- CreateIndex
CREATE UNIQUE INDEX "work_book_entry_id_key" ON "work_book_entry"("id");

-- CreateIndex
CREATE UNIQUE INDEX "attachment_initReportId_key" ON "attachment"("initReportId");

-- CreateIndex
CREATE UNIQUE INDEX "attachment_endReportId_key" ON "attachment"("endReportId");

-- CreateIndex
CREATE INDEX "folder_area_idx" ON "folder"("area", "isActive");

-- CreateIndex
CREATE INDEX "folder_parent_idx" ON "folder"("parentId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "folder_slug_parentId_userId_key" ON "folder"("slug", "parentId", "userId");

-- CreateIndex
CREATE INDEX "file_folder_idx" ON "file"("folderId", "isActive");

-- CreateIndex
CREATE INDEX "file_area_idx" ON "file"("area", "isActive");

-- CreateIndex
CREATE INDEX "safety_talk_attempt_userId_idx" ON "safety_talk_attempt"("userId");

-- CreateIndex
CREATE INDEX "safety_talk_attempt_userSafetyTalkId_idx" ON "safety_talk_attempt"("userSafetyTalkId");

-- CreateIndex
CREATE INDEX "user_safety_talk_userId_idx" ON "user_safety_talk"("userId");

-- CreateIndex
CREATE INDEX "user_safety_talk_category_idx" ON "user_safety_talk"("category");

-- CreateIndex
CREATE INDEX "user_safety_talk_status_idx" ON "user_safety_talk"("status");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_history_id_key" ON "equipment_history"("id");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_plan_slug_key" ON "maintenance_plan"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_plan_task_slug_key" ON "maintenance_plan_task"("slug");

-- CreateIndex
CREATE INDEX "startup_folder_company_status_idx" ON "startup_folder"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "tech_specs_folder_startupFolderId_key" ON "tech_specs_folder"("startupFolderId");

-- CreateIndex
CREATE UNIQUE INDEX "basic_folder_workerId_startupFolderId_key" ON "basic_folder"("workerId", "startupFolderId");

-- CreateIndex
CREATE UNIQUE INDEX "safety_and_health_folder_startupFolderId_key" ON "safety_and_health_folder"("startupFolderId");

-- CreateIndex
CREATE UNIQUE INDEX "worker_folders_workerId_startupFolderId_key" ON "worker_folders"("workerId", "startupFolderId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_folders_vehicleId_startupFolderId_key" ON "vehicle_folders"("vehicleId", "startupFolderId");

-- CreateIndex
CREATE UNIQUE INDEX "environmental_folder_startupFolderId_key" ON "environmental_folder"("startupFolderId");

-- CreateIndex
CREATE UNIQUE INDEX "environment_folder_startupFolderId_key" ON "environment_folder"("startupFolderId");

-- CreateIndex
CREATE UNIQUE INDEX "work_request_requestNumber_key" ON "work_request"("requestNumber");

-- CreateIndex
CREATE INDEX "activity_log_userId_idx" ON "activity_log"("userId");

-- CreateIndex
CREATE INDEX "activity_log_module_idx" ON "activity_log"("module");

-- CreateIndex
CREATE INDEX "activity_log_entityType_entityId_idx" ON "activity_log"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "activity_log_timestamp_idx" ON "activity_log"("timestamp");

-- CreateIndex
CREATE INDEX "inspection_comment_workEntryId_idx" ON "inspection_comment"("workEntryId");

-- CreateIndex
CREATE INDEX "inspection_comment_authorId_idx" ON "inspection_comment"("authorId");

-- CreateIndex
CREATE INDEX "inspection_comment_type_idx" ON "inspection_comment"("type");

-- CreateIndex
CREATE UNIQUE INDEX "external_company_rut_key" ON "external_company"("rut");

-- CreateIndex
CREATE INDEX "external_company_rut_idx" ON "external_company"("rut");

-- CreateIndex
CREATE INDEX "external_visitor_companyId_idx" ON "external_visitor"("companyId");

-- CreateIndex
CREATE INDEX "external_visitor_email_idx" ON "external_visitor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "external_visitor_email_companyId_key" ON "external_visitor"("email", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "visitor_talk_uniqueToken_key" ON "visitor_talk"("uniqueToken");

-- CreateIndex
CREATE INDEX "visitor_talk_uniqueToken_idx" ON "visitor_talk"("uniqueToken");

-- CreateIndex
CREATE INDEX "visitor_talk_companyId_idx" ON "visitor_talk"("companyId");

-- CreateIndex
CREATE INDEX "visitor_talk_completion_visitorTalkId_idx" ON "visitor_talk_completion"("visitorTalkId");

-- CreateIndex
CREATE INDEX "visitor_talk_completion_status_idx" ON "visitor_talk_completion"("status");

-- CreateIndex
CREATE UNIQUE INDEX "visitor_talk_completion_visitorId_visitorTalkId_key" ON "visitor_talk_completion"("visitorId", "visitorTalkId");

-- CreateIndex
CREATE INDEX "_AssignedUsers_B_index" ON "_AssignedUsers"("B");

-- CreateIndex
CREATE INDEX "_WorkPermitParticipants_B_index" ON "_WorkPermitParticipants"("B");

-- CreateIndex
CREATE INDEX "_EquipmentToWorkOrder_B_index" ON "_EquipmentToWorkOrder"("B");

-- CreateIndex
CREATE INDEX "_EquipmentToWorkRequest_B_index" ON "_EquipmentToWorkRequest"("B");

-- CreateIndex
CREATE INDEX "_WorkOrderManualDocuments_B_index" ON "_WorkOrderManualDocuments"("B");

-- CreateIndex
CREATE INDEX "_ExternalVisitorToVisitorTalk_B_index" ON "_ExternalVisitorToVisitorTalk"("B");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "twoFactor" ADD CONSTRAINT "twoFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_initReportId_fkey" FOREIGN KEY ("initReportId") REFERENCES "attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_endReportId_fkey" FOREIGN KEY ("endReportId") REFERENCES "attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_closureRequestedById_fkey" FOREIGN KEY ("closureRequestedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_closureApprovedById_fkey" FOREIGN KEY ("closureApprovedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_maintenancePlanTaskId_fkey" FOREIGN KEY ("maintenancePlanTaskId") REFERENCES "maintenance_plan_task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_workRequestId_fkey" FOREIGN KEY ("workRequestId") REFERENCES "work_request"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestone" ADD CONSTRAINT "milestone_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestone" ADD CONSTRAINT "milestone_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestone" ADD CONSTRAINT "milestone_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_book_entry" ADD CONSTRAINT "work_book_entry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_book_entry" ADD CONSTRAINT "work_book_entry_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_book_entry" ADD CONSTRAINT "work_book_entry_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_workEntryId_fkey" FOREIGN KEY ("workEntryId") REFERENCES "work_book_entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_maintenancePlanTaskId_fkey" FOREIGN KEY ("maintenancePlanTaskId") REFERENCES "maintenance_plan_task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_workRequestId_fkey" FOREIGN KEY ("workRequestId") REFERENCES "work_request"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_inspectionCommentId_fkey" FOREIGN KEY ("inspectionCommentId") REFERENCES "inspection_comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_permit" ADD CONSTRAINT "work_permit_approvalById_fkey" FOREIGN KEY ("approvalById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_permit" ADD CONSTRAINT "work_permit_closingById_fkey" FOREIGN KEY ("closingById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_permit" ADD CONSTRAINT "work_permit_preventionOfficerId_fkey" FOREIGN KEY ("preventionOfficerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_permit" ADD CONSTRAINT "work_permit_otNumberId_fkey" FOREIGN KEY ("otNumberId") REFERENCES "work_order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_permit" ADD CONSTRAINT "work_permit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_permit" ADD CONSTRAINT "work_permit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_permit_attachment" ADD CONSTRAINT "work_permit_attachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_permit_attachment" ADD CONSTRAINT "work_permit_attachment_workPermitId_fkey" FOREIGN KEY ("workPermitId") REFERENCES "work_permit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder" ADD CONSTRAINT "folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder" ADD CONSTRAINT "folder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_comment" ADD CONSTRAINT "file_comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_comment" ADD CONSTRAINT "file_comment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_talk_attempt" ADD CONSTRAINT "safety_talk_attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_talk_attempt" ADD CONSTRAINT "safety_talk_attempt_userSafetyTalkId_fkey" FOREIGN KEY ("userSafetyTalkId") REFERENCES "user_safety_talk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_safety_talk" ADD CONSTRAINT "user_safety_talk_approvalById_fkey" FOREIGN KEY ("approvalById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_safety_talk" ADD CONSTRAINT "user_safety_talk_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment_history" ADD CONSTRAINT "attachment_history_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "attachment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment_history" ADD CONSTRAINT "attachment_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_history" ADD CONSTRAINT "file_history_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_history" ADD CONSTRAINT "file_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_history" ADD CONSTRAINT "equipment_history_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_history" ADD CONSTRAINT "equipment_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_history" ADD CONSTRAINT "equipment_history_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_history" ADD CONSTRAINT "equipment_history_workEntryId_fkey" FOREIGN KEY ("workEntryId") REFERENCES "work_book_entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_plan" ADD CONSTRAINT "maintenance_plan_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_plan" ADD CONSTRAINT "maintenance_plan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_plan_task" ADD CONSTRAINT "maintenance_plan_task_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_plan_task" ADD CONSTRAINT "maintenance_plan_task_maintenancePlanId_fkey" FOREIGN KEY ("maintenancePlanId") REFERENCES "maintenance_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_plan_task" ADD CONSTRAINT "maintenance_plan_task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startup_folder" ADD CONSTRAINT "startup_folder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_specs_folder" ADD CONSTRAINT "tech_specs_folder_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_specs_folder" ADD CONSTRAINT "tech_specs_folder_startupFolderId_fkey" FOREIGN KEY ("startupFolderId") REFERENCES "startup_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_specs_document" ADD CONSTRAINT "tech_specs_document_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_specs_document" ADD CONSTRAINT "tech_specs_document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_specs_document" ADD CONSTRAINT "tech_specs_document_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "tech_specs_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basic_folder" ADD CONSTRAINT "basic_folder_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basic_folder" ADD CONSTRAINT "basic_folder_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basic_folder" ADD CONSTRAINT "basic_folder_startupFolderId_fkey" FOREIGN KEY ("startupFolderId") REFERENCES "startup_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basic_document" ADD CONSTRAINT "basic_document_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basic_document" ADD CONSTRAINT "basic_document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basic_document" ADD CONSTRAINT "basic_document_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "basic_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_and_health_folder" ADD CONSTRAINT "safety_and_health_folder_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_and_health_folder" ADD CONSTRAINT "safety_and_health_folder_startupFolderId_fkey" FOREIGN KEY ("startupFolderId") REFERENCES "startup_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_and_health_document" ADD CONSTRAINT "safety_and_health_document_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_and_health_document" ADD CONSTRAINT "safety_and_health_document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_and_health_document" ADD CONSTRAINT "safety_and_health_document_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "safety_and_health_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_folders" ADD CONSTRAINT "worker_folders_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_folders" ADD CONSTRAINT "worker_folders_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_folders" ADD CONSTRAINT "worker_folders_startupFolderId_fkey" FOREIGN KEY ("startupFolderId") REFERENCES "startup_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_document" ADD CONSTRAINT "worker_document_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_document" ADD CONSTRAINT "worker_document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_document" ADD CONSTRAINT "worker_document_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "worker_folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_folders" ADD CONSTRAINT "vehicle_folders_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_folders" ADD CONSTRAINT "vehicle_folders_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_folders" ADD CONSTRAINT "vehicle_folders_startupFolderId_fkey" FOREIGN KEY ("startupFolderId") REFERENCES "startup_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_document" ADD CONSTRAINT "vehicle_document_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_document" ADD CONSTRAINT "vehicle_document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_document" ADD CONSTRAINT "vehicle_document_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "vehicle_folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environmental_folder" ADD CONSTRAINT "environmental_folder_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environmental_folder" ADD CONSTRAINT "environmental_folder_startupFolderId_fkey" FOREIGN KEY ("startupFolderId") REFERENCES "startup_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environmental_document" ADD CONSTRAINT "environmental_document_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environmental_document" ADD CONSTRAINT "environmental_document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environmental_document" ADD CONSTRAINT "environmental_document_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "environmental_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environment_folder" ADD CONSTRAINT "environment_folder_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environment_folder" ADD CONSTRAINT "environment_folder_startupFolderId_fkey" FOREIGN KEY ("startupFolderId") REFERENCES "startup_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environment_document" ADD CONSTRAINT "environment_document_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environment_document" ADD CONSTRAINT "environment_document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environment_document" ADD CONSTRAINT "environment_document_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "environment_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_request" ADD CONSTRAINT "work_request_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_request" ADD CONSTRAINT "work_request_approvalById_fkey" FOREIGN KEY ("approvalById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_request" ADD CONSTRAINT "work_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_request_comment" ADD CONSTRAINT "work_request_comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_request_comment" ADD CONSTRAINT "work_request_comment_workRequestId_fkey" FOREIGN KEY ("workRequestId") REFERENCES "work_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_comment" ADD CONSTRAINT "inspection_comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_comment" ADD CONSTRAINT "inspection_comment_workEntryId_fkey" FOREIGN KEY ("workEntryId") REFERENCES "work_book_entry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_visitor" ADD CONSTRAINT "external_visitor_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "external_company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_talk" ADD CONSTRAINT "visitor_talk_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "external_company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_talk_completion" ADD CONSTRAINT "visitor_talk_completion_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "external_visitor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_talk_completion" ADD CONSTRAINT "visitor_talk_completion_visitorTalkId_fkey" FOREIGN KEY ("visitorTalkId") REFERENCES "visitor_talk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignedUsers" ADD CONSTRAINT "_AssignedUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignedUsers" ADD CONSTRAINT "_AssignedUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "work_book_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkPermitParticipants" ADD CONSTRAINT "_WorkPermitParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkPermitParticipants" ADD CONSTRAINT "_WorkPermitParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "work_permit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EquipmentToWorkOrder" ADD CONSTRAINT "_EquipmentToWorkOrder_A_fkey" FOREIGN KEY ("A") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EquipmentToWorkOrder" ADD CONSTRAINT "_EquipmentToWorkOrder_B_fkey" FOREIGN KEY ("B") REFERENCES "work_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EquipmentToWorkRequest" ADD CONSTRAINT "_EquipmentToWorkRequest_A_fkey" FOREIGN KEY ("A") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EquipmentToWorkRequest" ADD CONSTRAINT "_EquipmentToWorkRequest_B_fkey" FOREIGN KEY ("B") REFERENCES "work_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkOrderManualDocuments" ADD CONSTRAINT "_WorkOrderManualDocuments_A_fkey" FOREIGN KEY ("A") REFERENCES "attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkOrderManualDocuments" ADD CONSTRAINT "_WorkOrderManualDocuments_B_fkey" FOREIGN KEY ("B") REFERENCES "work_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExternalVisitorToVisitorTalk" ADD CONSTRAINT "_ExternalVisitorToVisitorTalk_A_fkey" FOREIGN KEY ("A") REFERENCES "external_visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExternalVisitorToVisitorTalk" ADD CONSTRAINT "_ExternalVisitorToVisitorTalk_B_fkey" FOREIGN KEY ("B") REFERENCES "visitor_talk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
