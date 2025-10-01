-- CreateEnum
CREATE TYPE "public"."ACCESS_ROLE" AS ENUM ('ADMIN', 'PARTNER_COMPANY');

-- CreateEnum
CREATE TYPE "public"."AREAS" AS ENUM ('OPERATIONS', 'INSTRUCTIONS', 'INTEGRITY_AND_MAINTENANCE', 'ENVIRONMENT', 'OPERATIONAL_SAFETY', 'QUALITY_AND_OPERATIONAL_EXCELLENCE', 'REGULATORY_COMPLIANCE', 'LEGAL', 'COMMUNITIES', 'PROJECTS', 'PURCHASING', 'ADMINISTRATION_AND_FINANCES', 'IT', 'GERENCY', 'DOCUMENTARY_LIBRARY');

-- CreateEnum
CREATE TYPE "public"."MODULES" AS ENUM ('ALL', 'HOME', 'REPORTABILITY', 'REPORTABILITY_OTC', 'NOTIFICATIONS', 'TOOLS', 'TUTORIALS', 'EQUIPMENT', 'SAFETY_TALK', 'WORK_ORDERS', 'WORK_PERMITS', 'LOCKOUT_PERMITS', 'DOCUMENTATION', 'WORK_REQUESTS', 'COMPANY', 'USERS', 'MAINTENANCE_PLANS', 'STARTUP_FOLDERS', 'LABOR_CONTROL_FOLDERS', 'VEHICLES', 'CONTACT', 'NONE');

-- CreateEnum
CREATE TYPE "public"."VEHICLE_TYPE" AS ENUM ('CAR', 'TRUCK', 'MOTORCYCLE', 'BUS', 'TRACTOR', 'TRAILER', 'OTHER', 'VAN');

-- CreateEnum
CREATE TYPE "public"."WORK_ORDER_STATUS" AS ENUM ('PLANNED', 'PENDING', 'COMPLETED', 'CANCELLED', 'IN_PROGRESS', 'CLOSURE_REQUESTED');

-- CreateEnum
CREATE TYPE "public"."WORK_ORDER_TYPE" AS ENUM ('CORRECTIVE', 'PREVENTIVE', 'PREDICTIVE', 'PROACTIVE');

-- CreateEnum
CREATE TYPE "public"."WORK_ORDER_CAPEX" AS ENUM ('CONFIDABILITY', 'MITIGATE_RISK', 'COMPLIANCE');

-- CreateEnum
CREATE TYPE "public"."WORK_ORDER_PRIORITY" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "public"."MILESTONE_STATUS" AS ENUM ('PENDING', 'COMPLETED', 'IN_PROGRESS', 'REQUESTED_CLOSURE');

-- CreateEnum
CREATE TYPE "public"."CRITICALITY" AS ENUM ('CRITICAL', 'SEMICRITICAL', 'UNCITICAL');

-- CreateEnum
CREATE TYPE "public"."WORK_APPLICATION_STATUS" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."ENTRY_TYPE" AS ENUM ('COMMENT', 'OTC_INSPECTION', 'DAILY_ACTIVITY', 'ADDITIONAL_ACTIVITY');

-- CreateEnum
CREATE TYPE "public"."INSPECTION_STATUS" AS ENUM ('REPORTED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "public"."WORK_PERMIT_STATUS" AS ENUM ('ACTIVE', 'REJECTED', 'COMPLETED', 'REVIEW_PENDING');

-- CreateEnum
CREATE TYPE "public"."LOCKOUT_PERMIT_STATUS" AS ENUM ('ACTIVE', 'REJECTED', 'COMPLETED', 'REVIEW_PENDING');

-- CreateEnum
CREATE TYPE "public"."LOCKOUT_TYPE" AS ENUM ('PREVENTIVE', 'CORRECTIVE', 'EMERGENCY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."SAFETY_TALK_CATEGORY" AS ENUM ('ENVIRONMENT', 'VISITOR', 'IRL');

-- CreateEnum
CREATE TYPE "public"."SAFETY_TALK_STATUS" AS ENUM ('PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'BLOCKED', 'MANUALLY_APPROVED');

-- CreateEnum
CREATE TYPE "public"."PLAN_FREQUENCY" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'FOURMONTHLY', 'BIANNUAL', 'YEARLY');

-- CreateEnum
CREATE TYPE "public"."ReviewStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'EXPIRED', 'TO_UPDATE');

-- CreateEnum
CREATE TYPE "public"."SafetyAndHealthDocumentType" AS ENUM ('COMPANY_INFO', 'STAFF_LIST', 'GANTT_CHART', 'MUTUAL', 'INTERNAL_REGULATION', 'ACCIDENT_RATE', 'RISK_MATRIX', 'PREVENTION_PLAN', 'WORK_PROCEDURE', 'EMERGENCY_PROCEDURE', 'TOOLS_MAINTENANCE', 'PPE_CERTIFICATION', 'HARASSMENT_PROCEDURE', 'ORGANIZATION_CHART', 'SAFE_WORK', 'RISK_ANALYSIS', 'WORK_PERMIT');

-- CreateEnum
CREATE TYPE "public"."WorkerDocumentType" AS ENUM ('CONTRACT', 'INTERNAL_REGULATION_RECEIPT', 'RISK_INFORMATION', 'ID_CARD', 'DRIVING_LICENSE', 'HEALTH_EXAM', 'PSYCHOTECHNICAL_EXAM', 'RISK_MATRIX_TRAINING', 'WORK_PROCEDURE_TRAINING', 'EMERGENCY_PROCEDURE_TRAINING', 'DEFENSIVE_DRIVING_TRAINING', 'MOUNTAIN_DEFENSIVE_DRIVING', 'TOOLS_MAINTENANCE_TRAINING', 'HARASSMENT_TRAINING', 'PPE_RECEIPT', 'PREVENTION_EXPERT', 'HIGH_RISK_TRAINING', 'ENVIRONMENTAL_TRAINING', 'ALCOHOL_AND_DRUGS_EXAM');

-- CreateEnum
CREATE TYPE "public"."VehicleDocumentType" AS ENUM ('EQUIPMENT_FILE', 'VEHICLE_REGISTRATION', 'CIRCULATION_PERMIT', 'TECHNICAL_REVIEW', 'INSURANCE', 'CHECKLIST', 'TRANSPORTATION_TO_OTC', 'HAZARDOUS_WASTE_TRANSPORT', 'NON_HAZARDOUS_WASTE_TRANSPORT', 'LIQUID_WASTE_TRANSPORT');

-- CreateEnum
CREATE TYPE "public"."EnvironmentalDocType" AS ENUM ('ENVIRONMENTAL_PLAN', 'SPILL_PREVENTION', 'WASTE_MANAGEMENT', 'ENVIRONMENTAL_TRAINING', 'ENVIRONMENTAL_MATRIX', 'RECT_CERTIFICATE', 'WATER_CERTIFICATE', 'WATER_FACTORY_RESOLUTION', 'DINING_RESOLUTION', 'CHEMICAL_TOILET_CONTRACT', 'SAFETY_DATA_SHEET', 'LAYOUT_PLAN', 'ELECTRICAL_DECLARATION', 'GAS_DECLARATION', 'PEST_CONTROL_RESOLUTION', 'PEST_CONTROL_CERTIFICATE', 'PEST_CONTROL_PRODUCTS_SDS', 'PEST_CONTROL_TRACKING', 'HAZARDOUS_STORAGE_CHECKLIST', 'HAZARDOUS_INVENTORY', 'LAND_MOVEMENT_PERMIT', 'DEBRIS_ROUTE', 'FUEL_CONSUMPTION', 'WATER_CONSUMPTION', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."EnvironmentDocType" AS ENUM ('WORK_PROCEDURE', 'ENVIRONMENTAL_ASPECTS_AND_IMPACTS_MATRIX', 'SAFETY_DATA_SHEET_FOR_CHEMICALS', 'WORKER_TRAINING_RECORD', 'HEALTH_RESOLUTION_FOR_WORKERS_DRINKING_WATER', 'HEALTH_RESOLUTION_FOR_THE_CHEMICAL_TOILET', 'RESOLUTION_FOR_THE_SITE_WHERE_DEBRIS_WILL_BE_DISPOSED', 'RESOLUTION_FOR_THE_DEBRIS_TRANSPORTER', 'DEBRIS_TRANSFER_ROUTE', 'HEALTH_RESOLUTION_FROM_THE_PEST_CONTROL_COMPANY', 'ENVIRONMENTAL_MANAGEMENT_PLAN');

-- CreateEnum
CREATE TYPE "public"."BasicDocumentType" AS ENUM ('CONTRACT', 'INSURANCE', 'PPE_RECEIPT', 'SAFETY_AND_HEALTH_INFO');

-- CreateEnum
CREATE TYPE "public"."TechSpecsDocumentType" AS ENUM ('GANTT_CHART', 'TECHNICAL_WORK_PROCEDURE');

-- CreateEnum
CREATE TYPE "public"."DocumentCategory" AS ENUM ('VEHICLES', 'PERSONNEL', 'ENVIRONMENTAL', 'ENVIRONMENT', 'SAFETY_AND_HEALTH', 'BASIC', 'TECHNICAL_SPECS');

-- CreateEnum
CREATE TYPE "public"."StartupFolderType" AS ENUM ('BASIC', 'FULL');

-- CreateEnum
CREATE TYPE "public"."StartupFolderStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."WORK_REQUEST_STATUS" AS ENUM ('REPORTED', 'APPROVED', 'ATTENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."WORK_REQUEST_TYPE" AS ENUM ('MECHANIC', 'ELECTRIC');

-- CreateEnum
CREATE TYPE "public"."ACTIVITY_TYPE" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'SUBMIT', 'APPROVE', 'REJECT', 'CANCEL', 'COMPLETE', 'VIEW', 'DOWNLOAD', 'UPLOAD', 'COMMENT', 'ASSIGN', 'UNASSIGN', 'LOGIN', 'LOGOUT');

-- CreateEnum
CREATE TYPE "public"."INSPECTION_COMMENT_TYPE" AS ENUM ('SUPERVISOR_RESPONSE', 'RESPONSIBLE_APPROVAL', 'RESPONSIBLE_REJECTION');

-- CreateEnum
CREATE TYPE "public"."VISITOR_TALK_STATUS" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."LABOR_CONTROL_STATUS" AS ENUM ('DRAFT', 'APPROVED', 'REJECTED', 'SUBMITTED');

-- CreateEnum
CREATE TYPE "public"."LABOR_CONTROL_DOCUMENT_TYPE" AS ENUM ('F30', 'F30_1', 'SINIESTRALITY', 'TRG_TREASURY_CERTIFICATE');

-- CreateEnum
CREATE TYPE "public"."WORKER_LABOR_CONTROL_DOCUMENT_TYPE" AS ENUM ('ATTENDANCE_BOOK', 'MEDICAL_LEAVE', 'PAYROLL_STTLEMENT', 'STTLEMENT', 'NOTICE_OF_TERMINATION');

-- CreateTable
CREATE TABLE "public"."user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT NOT NULL,
    "accessRole" "public"."ACCESS_ROLE" NOT NULL DEFAULT 'PARTNER_COMPANY',
    "allowedModules" "public"."MODULES"[] DEFAULT ARRAY['ALL']::"public"."MODULES"[],
    "allowedCompanies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "internalRole" TEXT,
    "area" "public"."AREAS",
    "banned" BOOLEAN,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),
    "rut" TEXT NOT NULL,
    "twoFactorEnabled" BOOLEAN,
    "documentAreas" "public"."AREAS"[] DEFAULT ARRAY[]::"public"."AREAS"[],
    "internalArea" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT,
    "isSupervisor" BOOLEAN,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification" (
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
CREATE TABLE "public"."twoFactor" (
    "id" TEXT NOT NULL,
    "secret" TEXT,
    "backupCodes" TEXT,
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "public"."session" (
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
CREATE TABLE "public"."account" (
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
CREATE TABLE "public"."verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."company" (
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
CREATE TABLE "public"."vehicle" (
    "id" TEXT NOT NULL,
    "plate" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "brand" TEXT,
    "type" "public"."VEHICLE_TYPE",
    "color" TEXT,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."work_order" (
    "id" TEXT NOT NULL,
    "otNumber" TEXT NOT NULL,
    "type" "public"."WORK_ORDER_TYPE" NOT NULL,
    "status" "public"."WORK_ORDER_STATUS" NOT NULL DEFAULT 'PLANNED',
    "progress" DOUBLE PRECISION DEFAULT 0,
    "solicitationDate" TIMESTAMP(3) NOT NULL,
    "solicitationTime" TEXT NOT NULL,
    "workRequest" TEXT NOT NULL,
    "workDescription" TEXT,
    "priority" "public"."WORK_ORDER_PRIORITY" NOT NULL,
    "capex" "public"."WORK_ORDER_CAPEX",
    "programDate" TIMESTAMP(3) NOT NULL,
    "estimatedHours" DOUBLE PRECISION NOT NULL,
    "estimatedDays" DOUBLE PRECISION NOT NULL,
    "estimatedEndDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
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
CREATE TABLE "public"."milestone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."MILESTONE_STATUS" NOT NULL DEFAULT 'PENDING',
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
CREATE TABLE "public"."equipment" (
    "id" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "isOperational" BOOLEAN NOT NULL DEFAULT true,
    "type" TEXT,
    "tag" TEXT NOT NULL,
    "criticality" "public"."CRITICALITY",
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentId" TEXT,
    "createdById" TEXT,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."work_book_entry" (
    "id" TEXT NOT NULL,
    "entryType" "public"."ENTRY_TYPE" NOT NULL,
    "executionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activityName" TEXT,
    "activityStartTime" TEXT,
    "activityEndTime" TEXT,
    "comments" TEXT,
    "inspectionStatus" "public"."INSPECTION_STATUS" DEFAULT 'REPORTED',
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
CREATE TABLE "public"."attachment" (
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
CREATE TABLE "public"."work_permit" (
    "id" TEXT NOT NULL,
    "status" "public"."WORK_PERMIT_STATUS" NOT NULL DEFAULT 'REVIEW_PENDING',
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
CREATE TABLE "public"."work_permit_attachment" (
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
CREATE TABLE "public"."lockout_permit" (
    "id" TEXT NOT NULL,
    "status" "public"."LOCKOUT_PERMIT_STATUS" NOT NULL DEFAULT 'REVIEW_PENDING',
    "lockoutType" "public"."LOCKOUT_TYPE" NOT NULL,
    "lockoutTypeOther" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "activitiesToExecute" TEXT[],
    "removeLockoutReview" BOOLEAN,
    "observations" TEXT,
    "approved" BOOLEAN,
    "approvalDate" TIMESTAMP(3),
    "approvalTime" TEXT,
    "finalObservations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvalNotes" TEXT,
    "supervisorId" TEXT,
    "operatorId" TEXT,
    "removeLockoutId" TEXT,
    "areaResponsibleId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "otNumberId" TEXT,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "lockout_permit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lockout_registration" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "lockNumber" TEXT NOT NULL,
    "installDate" TIMESTAMP(3),
    "installTime" TEXT,
    "removeDate" TIMESTAMP(3),
    "removeTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lockoutPermitId" TEXT NOT NULL,

    CONSTRAINT "lockout_registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."zero_energy_review" (
    "id" TEXT NOT NULL,
    "location" TEXT,
    "action" TEXT NOT NULL,
    "reviewedZero" BOOLEAN,
    "lockoutPermitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "performedById" TEXT NOT NULL,
    "reviewerId" TEXT,

    CONSTRAINT "zero_energy_review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lockout_permit_attachment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT NOT NULL,
    "lockoutPermitId" TEXT NOT NULL,

    CONSTRAINT "lockout_permit_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."folder" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "root" BOOLEAN NOT NULL DEFAULT false,
    "area" "public"."AREAS" NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'default',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."file" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "area" "public"."AREAS",
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
CREATE TABLE "public"."file_comment" (
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
CREATE TABLE "public"."Counter" (
    "id" TEXT NOT NULL DEFAULT 'ot_counter',
    "value" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."work_request_counter" (
    "id" TEXT NOT NULL DEFAULT 'work_request_counter',
    "value" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "work_request_counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."safety_talk_attempt" (
    "id" TEXT NOT NULL,
    "category" "public"."SAFETY_TALK_CATEGORY" NOT NULL,
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
CREATE TABLE "public"."user_safety_talk" (
    "id" TEXT NOT NULL,
    "category" "public"."SAFETY_TALK_CATEGORY" NOT NULL,
    "status" "public"."SAFETY_TALK_STATUS" NOT NULL DEFAULT 'PENDING',
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
CREATE TABLE "public"."attachment_history" (
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
CREATE TABLE "public"."file_history" (
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
CREATE TABLE "public"."equipment_history" (
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
CREATE TABLE "public"."maintenance_plan" (
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
CREATE TABLE "public"."maintenance_plan_task" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "frequency" "public"."PLAN_FREQUENCY" NOT NULL,
    "nextDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isAutomated" BOOLEAN NOT NULL DEFAULT false,
    "automatedCompanyId" TEXT,
    "automatedSupervisorId" TEXT,
    "automatedWorkOrderType" "public"."WORK_ORDER_TYPE",
    "automatedPriority" "public"."WORK_ORDER_PRIORITY",
    "automatedCapex" "public"."WORK_ORDER_CAPEX",
    "automatedEstimatedDays" INTEGER,
    "automatedEstimatedHours" INTEGER,
    "automatedWorkDescription" TEXT,
    "emailsForCopy" TEXT[],
    "equipmentId" TEXT NOT NULL,
    "maintenancePlanId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "maintenance_plan_task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."startup_folder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Carpeta de arranque',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "public"."StartupFolderType" NOT NULL DEFAULT 'FULL',
    "status" "public"."StartupFolderStatus" NOT NULL DEFAULT 'PENDING',
    "moreMonthDuration" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "startup_folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tech_specs_folder" (
    "id" TEXT NOT NULL,
    "status" "public"."ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "additionalNotificationEmails" TEXT[],
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewerId" TEXT,
    "startupFolderId" TEXT NOT NULL,

    CONSTRAINT "tech_specs_folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tech_specs_document" (
    "id" TEXT NOT NULL,
    "type" "public"."TechSpecsDocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" "public"."DocumentCategory" NOT NULL,
    "status" "public"."ReviewStatus" NOT NULL DEFAULT 'DRAFT',
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
CREATE TABLE "public"."basic_folder" (
    "id" TEXT NOT NULL,
    "status" "public"."ReviewStatus" NOT NULL DEFAULT 'DRAFT',
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
CREATE TABLE "public"."basic_document" (
    "id" TEXT NOT NULL,
    "type" "public"."BasicDocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" "public"."DocumentCategory" NOT NULL,
    "status" "public"."ReviewStatus" NOT NULL DEFAULT 'DRAFT',
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
CREATE TABLE "public"."safety_and_health_folder" (
    "id" TEXT NOT NULL,
    "status" "public"."ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "additionalNotificationEmails" TEXT[],
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewerId" TEXT,
    "startupFolderId" TEXT NOT NULL,

    CONSTRAINT "safety_and_health_folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."safety_and_health_document" (
    "id" TEXT NOT NULL,
    "type" "public"."SafetyAndHealthDocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" "public"."DocumentCategory" NOT NULL,
    "status" "public"."ReviewStatus" NOT NULL DEFAULT 'DRAFT',
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
CREATE TABLE "public"."worker_folders" (
    "id" TEXT NOT NULL,
    "status" "public"."ReviewStatus" NOT NULL DEFAULT 'DRAFT',
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
CREATE TABLE "public"."worker_document" (
    "id" TEXT NOT NULL,
    "type" "public"."WorkerDocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" "public"."DocumentCategory" NOT NULL,
    "status" "public"."ReviewStatus" NOT NULL DEFAULT 'DRAFT',
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
CREATE TABLE "public"."vehicle_folders" (
    "id" TEXT NOT NULL,
    "status" "public"."ReviewStatus" NOT NULL DEFAULT 'DRAFT',
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
CREATE TABLE "public"."vehicle_document" (
    "id" TEXT NOT NULL,
    "type" "public"."VehicleDocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" "public"."DocumentCategory" NOT NULL,
    "status" "public"."ReviewStatus" NOT NULL DEFAULT 'DRAFT',
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
CREATE TABLE "public"."environmental_folder" (
    "id" TEXT NOT NULL,
    "status" "public"."ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "additionalNotificationEmails" TEXT[],
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewerId" TEXT,
    "startupFolderId" TEXT NOT NULL,

    CONSTRAINT "environmental_folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."environmental_document" (
    "id" TEXT NOT NULL,
    "type" "public"."EnvironmentalDocType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" "public"."DocumentCategory" NOT NULL,
    "status" "public"."ReviewStatus" NOT NULL DEFAULT 'DRAFT',
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
CREATE TABLE "public"."environment_folder" (
    "id" TEXT NOT NULL,
    "status" "public"."ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "additionalNotificationEmails" TEXT[],
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewerId" TEXT,
    "startupFolderId" TEXT NOT NULL,

    CONSTRAINT "environment_folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."environment_document" (
    "id" TEXT NOT NULL,
    "type" "public"."EnvironmentDocType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" "public"."DocumentCategory" NOT NULL,
    "status" "public"."ReviewStatus" NOT NULL DEFAULT 'DRAFT',
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
CREATE TABLE "public"."work_request" (
    "id" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observations" TEXT,
    "customLocation" TEXT,
    "status" "public"."WORK_REQUEST_STATUS" NOT NULL DEFAULT 'REPORTED',
    "operatorId" TEXT,
    "workType" "public"."WORK_REQUEST_TYPE",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvalDate" TIMESTAMP(3),
    "approvalById" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "work_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."work_request_comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "workRequestId" TEXT NOT NULL,

    CONSTRAINT "work_request_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."activity_log" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "module" "public"."MODULES" NOT NULL,
    "action" "public"."ACTIVITY_TYPE" NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "metadata" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inspection_comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "public"."INSPECTION_COMMENT_TYPE" NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "workEntryId" TEXT NOT NULL,

    CONSTRAINT "inspection_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."external_company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "emails" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "external_company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."external_visitor" (
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
CREATE TABLE "public"."visitor_talk" (
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
CREATE TABLE "public"."visitor_talk_completion" (
    "id" TEXT NOT NULL,
    "status" "public"."VISITOR_TALK_STATUS" NOT NULL DEFAULT 'NOT_STARTED',
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
CREATE TABLE "public"."file_access_log" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "containerType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "accessRole" "public"."ACCESS_ROLE" NOT NULL DEFAULT 'PARTNER_COMPANY',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "companyId" TEXT,

    CONSTRAINT "file_access_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LaborControlFolder" (
    "id" TEXT NOT NULL,
    "status" "public"."LABOR_CONTROL_STATUS" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emails" TEXT[],
    "companyFolderStatus" "public"."LABOR_CONTROL_STATUS" NOT NULL DEFAULT 'DRAFT',
    "companyId" TEXT NOT NULL,

    CONSTRAINT "LaborControlFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkerLaborControlFolder" (
    "id" TEXT NOT NULL,
    "status" "public"."LABOR_CONTROL_STATUS" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emails" TEXT[],
    "workerId" TEXT NOT NULL,
    "laborControlFolderId" TEXT,

    CONSTRAINT "WorkerLaborControlFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LaborControlDocument" (
    "id" TEXT NOT NULL,
    "type" "public"."LABOR_CONTROL_DOCUMENT_TYPE" NOT NULL,
    "status" "public"."LABOR_CONTROL_STATUS" NOT NULL DEFAULT 'DRAFT',
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "reviewNotes" TEXT,
    "reviewDate" TIMESTAMP(3),
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "uploadById" TEXT NOT NULL,
    "reviewById" TEXT,
    "folderId" TEXT NOT NULL,

    CONSTRAINT "LaborControlDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkerLaborControlDocument" (
    "id" TEXT NOT NULL,
    "type" "public"."WORKER_LABOR_CONTROL_DOCUMENT_TYPE" NOT NULL,
    "status" "public"."LABOR_CONTROL_STATUS" NOT NULL DEFAULT 'DRAFT',
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "reviewNotes" TEXT,
    "reviewDate" TIMESTAMP(3),
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "uploadById" TEXT NOT NULL,
    "reviewById" TEXT,
    "folderId" TEXT NOT NULL,

    CONSTRAINT "WorkerLaborControlDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_AssignedUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AssignedUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_WorkPermitParticipants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_WorkPermitParticipants_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_EquipmentToWorkOrder" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EquipmentToWorkOrder_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_EquipmentToWorkRequest" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EquipmentToWorkRequest_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_EquipmentToLockoutPermit" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EquipmentToLockoutPermit_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_WorkOrderManualDocuments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_WorkOrderManualDocuments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_ExternalVisitorToVisitorTalk" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ExternalVisitorToVisitorTalk_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "email_idx" ON "public"."user"("email");

-- CreateIndex
CREATE INDEX "company_id_idx" ON "public"."user"("companyId");

-- CreateIndex
CREATE INDEX "access_role_is_active_idx" ON "public"."user"("accessRole", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_rut_key" ON "public"."user"("rut");

-- CreateIndex
CREATE INDEX "notification_user_id_idx" ON "public"."notification"("userId");

-- CreateIndex
CREATE INDEX "notification_is_read_idx" ON "public"."notification"("isRead");

-- CreateIndex
CREATE INDEX "notification_target_role_idx" ON "public"."notification"("targetRole");

-- CreateIndex
CREATE UNIQUE INDEX "twoFactor_id_key" ON "public"."twoFactor"("id");

-- CreateIndex
CREATE UNIQUE INDEX "twoFactor_userId_key" ON "public"."twoFactor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "public"."session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "company_rut_key" ON "public"."company"("rut");

-- CreateIndex
CREATE INDEX "rut_idx" ON "public"."company"("rut");

-- CreateIndex
CREATE INDEX "name_idx" ON "public"."company"("name");

-- CreateIndex
CREATE INDEX "is_active_idx" ON "public"."company"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "company_id_key" ON "public"."company"("id");

-- CreateIndex
CREATE INDEX "vehicle_company_id_idx" ON "public"."vehicle"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "work_order_initReportId_key" ON "public"."work_order"("initReportId");

-- CreateIndex
CREATE UNIQUE INDEX "work_order_endReportId_key" ON "public"."work_order"("endReportId");

-- CreateIndex
CREATE INDEX "status_idx" ON "public"."work_order"("status");

-- CreateIndex
CREATE INDEX "ot_number_idx" ON "public"."work_order"("otNumber");

-- CreateIndex
CREATE INDEX "company_status_idx" ON "public"."work_order"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "work_order_id_key" ON "public"."work_order"("id");

-- CreateIndex
CREATE UNIQUE INDEX "work_order_otNumber_key" ON "public"."work_order"("otNumber");

-- CreateIndex
CREATE INDEX "milestone_workOrderId_order_idx" ON "public"."milestone"("workOrderId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "milestone_id_key" ON "public"."milestone"("id");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_id_key" ON "public"."equipment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_tag_key" ON "public"."equipment"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_barcode_key" ON "public"."equipment"("barcode");

-- CreateIndex
CREATE INDEX "work_book_entry_milestoneId_idx" ON "public"."work_book_entry"("milestoneId");

-- CreateIndex
CREATE INDEX "work_book_entry_workOrderId_createdAt_idx" ON "public"."work_book_entry"("workOrderId", "createdAt");

-- CreateIndex
CREATE INDEX "work_book_entry_workOrderId_entryType_idx" ON "public"."work_book_entry"("workOrderId", "entryType");

-- CreateIndex
CREATE UNIQUE INDEX "work_book_entry_id_key" ON "public"."work_book_entry"("id");

-- CreateIndex
CREATE UNIQUE INDEX "attachment_initReportId_key" ON "public"."attachment"("initReportId");

-- CreateIndex
CREATE UNIQUE INDEX "attachment_endReportId_key" ON "public"."attachment"("endReportId");

-- CreateIndex
CREATE INDEX "folder_area_idx" ON "public"."folder"("area", "isActive");

-- CreateIndex
CREATE INDEX "folder_parent_idx" ON "public"."folder"("parentId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "folder_slug_parentId_userId_key" ON "public"."folder"("slug", "parentId", "userId");

-- CreateIndex
CREATE INDEX "file_folder_idx" ON "public"."file"("folderId", "isActive");

-- CreateIndex
CREATE INDEX "file_area_idx" ON "public"."file"("area", "isActive");

-- CreateIndex
CREATE INDEX "safety_talk_attempt_userId_idx" ON "public"."safety_talk_attempt"("userId");

-- CreateIndex
CREATE INDEX "safety_talk_attempt_userSafetyTalkId_idx" ON "public"."safety_talk_attempt"("userSafetyTalkId");

-- CreateIndex
CREATE INDEX "user_safety_talk_userId_idx" ON "public"."user_safety_talk"("userId");

-- CreateIndex
CREATE INDEX "user_safety_talk_category_idx" ON "public"."user_safety_talk"("category");

-- CreateIndex
CREATE INDEX "user_safety_talk_status_idx" ON "public"."user_safety_talk"("status");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_history_id_key" ON "public"."equipment_history"("id");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_plan_slug_key" ON "public"."maintenance_plan"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_plan_task_slug_key" ON "public"."maintenance_plan_task"("slug");

-- CreateIndex
CREATE INDEX "startup_folder_company_status_idx" ON "public"."startup_folder"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "tech_specs_folder_startupFolderId_key" ON "public"."tech_specs_folder"("startupFolderId");

-- CreateIndex
CREATE UNIQUE INDEX "basic_folder_workerId_startupFolderId_key" ON "public"."basic_folder"("workerId", "startupFolderId");

-- CreateIndex
CREATE UNIQUE INDEX "safety_and_health_folder_startupFolderId_key" ON "public"."safety_and_health_folder"("startupFolderId");

-- CreateIndex
CREATE UNIQUE INDEX "worker_folders_workerId_startupFolderId_key" ON "public"."worker_folders"("workerId", "startupFolderId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_folders_vehicleId_startupFolderId_key" ON "public"."vehicle_folders"("vehicleId", "startupFolderId");

-- CreateIndex
CREATE UNIQUE INDEX "environmental_folder_startupFolderId_key" ON "public"."environmental_folder"("startupFolderId");

-- CreateIndex
CREATE UNIQUE INDEX "environment_folder_startupFolderId_key" ON "public"."environment_folder"("startupFolderId");

-- CreateIndex
CREATE UNIQUE INDEX "work_request_requestNumber_key" ON "public"."work_request"("requestNumber");

-- CreateIndex
CREATE INDEX "activity_log_userId_idx" ON "public"."activity_log"("userId");

-- CreateIndex
CREATE INDEX "activity_log_module_idx" ON "public"."activity_log"("module");

-- CreateIndex
CREATE INDEX "activity_log_entityType_entityId_idx" ON "public"."activity_log"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "activity_log_timestamp_idx" ON "public"."activity_log"("timestamp");

-- CreateIndex
CREATE INDEX "inspection_comment_workEntryId_idx" ON "public"."inspection_comment"("workEntryId");

-- CreateIndex
CREATE INDEX "inspection_comment_authorId_idx" ON "public"."inspection_comment"("authorId");

-- CreateIndex
CREATE INDEX "inspection_comment_type_idx" ON "public"."inspection_comment"("type");

-- CreateIndex
CREATE UNIQUE INDEX "external_company_rut_key" ON "public"."external_company"("rut");

-- CreateIndex
CREATE INDEX "external_company_rut_idx" ON "public"."external_company"("rut");

-- CreateIndex
CREATE INDEX "external_visitor_companyId_idx" ON "public"."external_visitor"("companyId");

-- CreateIndex
CREATE INDEX "external_visitor_email_idx" ON "public"."external_visitor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "external_visitor_email_companyId_key" ON "public"."external_visitor"("email", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "visitor_talk_uniqueToken_key" ON "public"."visitor_talk"("uniqueToken");

-- CreateIndex
CREATE INDEX "visitor_talk_uniqueToken_idx" ON "public"."visitor_talk"("uniqueToken");

-- CreateIndex
CREATE INDEX "visitor_talk_companyId_idx" ON "public"."visitor_talk"("companyId");

-- CreateIndex
CREATE INDEX "visitor_talk_completion_visitorTalkId_idx" ON "public"."visitor_talk_completion"("visitorTalkId");

-- CreateIndex
CREATE INDEX "visitor_talk_completion_status_idx" ON "public"."visitor_talk_completion"("status");

-- CreateIndex
CREATE UNIQUE INDEX "visitor_talk_completion_visitorId_visitorTalkId_key" ON "public"."visitor_talk_completion"("visitorId", "visitorTalkId");

-- CreateIndex
CREATE INDEX "file_access_log_userId_idx" ON "public"."file_access_log"("userId");

-- CreateIndex
CREATE INDEX "file_access_log_companyId_idx" ON "public"."file_access_log"("companyId");

-- CreateIndex
CREATE INDEX "_AssignedUsers_B_index" ON "public"."_AssignedUsers"("B");

-- CreateIndex
CREATE INDEX "_WorkPermitParticipants_B_index" ON "public"."_WorkPermitParticipants"("B");

-- CreateIndex
CREATE INDEX "_EquipmentToWorkOrder_B_index" ON "public"."_EquipmentToWorkOrder"("B");

-- CreateIndex
CREATE INDEX "_EquipmentToWorkRequest_B_index" ON "public"."_EquipmentToWorkRequest"("B");

-- CreateIndex
CREATE INDEX "_EquipmentToLockoutPermit_B_index" ON "public"."_EquipmentToLockoutPermit"("B");

-- CreateIndex
CREATE INDEX "_WorkOrderManualDocuments_B_index" ON "public"."_WorkOrderManualDocuments"("B");

-- CreateIndex
CREATE INDEX "_ExternalVisitorToVisitorTalk_B_index" ON "public"."_ExternalVisitorToVisitorTalk"("B");

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."twoFactor" ADD CONSTRAINT "twoFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company" ADD CONSTRAINT "company_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vehicle" ADD CONSTRAINT "vehicle_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_order" ADD CONSTRAINT "work_order_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_order" ADD CONSTRAINT "work_order_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_order" ADD CONSTRAINT "work_order_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_order" ADD CONSTRAINT "work_order_initReportId_fkey" FOREIGN KEY ("initReportId") REFERENCES "public"."attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_order" ADD CONSTRAINT "work_order_endReportId_fkey" FOREIGN KEY ("endReportId") REFERENCES "public"."attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_order" ADD CONSTRAINT "work_order_closureRequestedById_fkey" FOREIGN KEY ("closureRequestedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_order" ADD CONSTRAINT "work_order_closureApprovedById_fkey" FOREIGN KEY ("closureApprovedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_order" ADD CONSTRAINT "work_order_maintenancePlanTaskId_fkey" FOREIGN KEY ("maintenancePlanTaskId") REFERENCES "public"."maintenance_plan_task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_order" ADD CONSTRAINT "work_order_workRequestId_fkey" FOREIGN KEY ("workRequestId") REFERENCES "public"."work_request"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."milestone" ADD CONSTRAINT "milestone_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."milestone" ADD CONSTRAINT "milestone_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."milestone" ADD CONSTRAINT "milestone_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "public"."work_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."equipment" ADD CONSTRAINT "equipment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."equipment" ADD CONSTRAINT "equipment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_book_entry" ADD CONSTRAINT "work_book_entry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_book_entry" ADD CONSTRAINT "work_book_entry_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "public"."work_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_book_entry" ADD CONSTRAINT "work_book_entry_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "public"."milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attachment" ADD CONSTRAINT "attachment_workEntryId_fkey" FOREIGN KEY ("workEntryId") REFERENCES "public"."work_book_entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attachment" ADD CONSTRAINT "attachment_maintenancePlanTaskId_fkey" FOREIGN KEY ("maintenancePlanTaskId") REFERENCES "public"."maintenance_plan_task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attachment" ADD CONSTRAINT "attachment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "public"."equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attachment" ADD CONSTRAINT "attachment_workRequestId_fkey" FOREIGN KEY ("workRequestId") REFERENCES "public"."work_request"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attachment" ADD CONSTRAINT "attachment_inspectionCommentId_fkey" FOREIGN KEY ("inspectionCommentId") REFERENCES "public"."inspection_comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_permit" ADD CONSTRAINT "work_permit_approvalById_fkey" FOREIGN KEY ("approvalById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_permit" ADD CONSTRAINT "work_permit_closingById_fkey" FOREIGN KEY ("closingById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_permit" ADD CONSTRAINT "work_permit_preventionOfficerId_fkey" FOREIGN KEY ("preventionOfficerId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_permit" ADD CONSTRAINT "work_permit_otNumberId_fkey" FOREIGN KEY ("otNumberId") REFERENCES "public"."work_order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_permit" ADD CONSTRAINT "work_permit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_permit" ADD CONSTRAINT "work_permit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_permit_attachment" ADD CONSTRAINT "work_permit_attachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_permit_attachment" ADD CONSTRAINT "work_permit_attachment_workPermitId_fkey" FOREIGN KEY ("workPermitId") REFERENCES "public"."work_permit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lockout_permit" ADD CONSTRAINT "lockout_permit_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lockout_permit" ADD CONSTRAINT "lockout_permit_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lockout_permit" ADD CONSTRAINT "lockout_permit_removeLockoutId_fkey" FOREIGN KEY ("removeLockoutId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lockout_permit" ADD CONSTRAINT "lockout_permit_areaResponsibleId_fkey" FOREIGN KEY ("areaResponsibleId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lockout_permit" ADD CONSTRAINT "lockout_permit_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lockout_permit" ADD CONSTRAINT "lockout_permit_otNumberId_fkey" FOREIGN KEY ("otNumberId") REFERENCES "public"."work_order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lockout_permit" ADD CONSTRAINT "lockout_permit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lockout_registration" ADD CONSTRAINT "lockout_registration_lockoutPermitId_fkey" FOREIGN KEY ("lockoutPermitId") REFERENCES "public"."lockout_permit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."zero_energy_review" ADD CONSTRAINT "zero_energy_review_lockoutPermitId_fkey" FOREIGN KEY ("lockoutPermitId") REFERENCES "public"."lockout_permit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."zero_energy_review" ADD CONSTRAINT "zero_energy_review_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "public"."equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."zero_energy_review" ADD CONSTRAINT "zero_energy_review_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."zero_energy_review" ADD CONSTRAINT "zero_energy_review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lockout_permit_attachment" ADD CONSTRAINT "lockout_permit_attachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lockout_permit_attachment" ADD CONSTRAINT "lockout_permit_attachment_lockoutPermitId_fkey" FOREIGN KEY ("lockoutPermitId") REFERENCES "public"."lockout_permit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."folder" ADD CONSTRAINT "folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."folder" ADD CONSTRAINT "folder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file" ADD CONSTRAINT "file_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file" ADD CONSTRAINT "file_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file_comment" ADD CONSTRAINT "file_comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file_comment" ADD CONSTRAINT "file_comment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "public"."file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."safety_talk_attempt" ADD CONSTRAINT "safety_talk_attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."safety_talk_attempt" ADD CONSTRAINT "safety_talk_attempt_userSafetyTalkId_fkey" FOREIGN KEY ("userSafetyTalkId") REFERENCES "public"."user_safety_talk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_safety_talk" ADD CONSTRAINT "user_safety_talk_approvalById_fkey" FOREIGN KEY ("approvalById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_safety_talk" ADD CONSTRAINT "user_safety_talk_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attachment_history" ADD CONSTRAINT "attachment_history_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "public"."attachment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attachment_history" ADD CONSTRAINT "attachment_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file_history" ADD CONSTRAINT "file_history_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "public"."file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file_history" ADD CONSTRAINT "file_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."equipment_history" ADD CONSTRAINT "equipment_history_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "public"."equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."equipment_history" ADD CONSTRAINT "equipment_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."equipment_history" ADD CONSTRAINT "equipment_history_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "public"."work_order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."equipment_history" ADD CONSTRAINT "equipment_history_workEntryId_fkey" FOREIGN KEY ("workEntryId") REFERENCES "public"."work_book_entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."maintenance_plan" ADD CONSTRAINT "maintenance_plan_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "public"."equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."maintenance_plan" ADD CONSTRAINT "maintenance_plan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."maintenance_plan_task" ADD CONSTRAINT "maintenance_plan_task_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "public"."equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."maintenance_plan_task" ADD CONSTRAINT "maintenance_plan_task_maintenancePlanId_fkey" FOREIGN KEY ("maintenancePlanId") REFERENCES "public"."maintenance_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."maintenance_plan_task" ADD CONSTRAINT "maintenance_plan_task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."startup_folder" ADD CONSTRAINT "startup_folder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tech_specs_folder" ADD CONSTRAINT "tech_specs_folder_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tech_specs_folder" ADD CONSTRAINT "tech_specs_folder_startupFolderId_fkey" FOREIGN KEY ("startupFolderId") REFERENCES "public"."startup_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tech_specs_document" ADD CONSTRAINT "tech_specs_document_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tech_specs_document" ADD CONSTRAINT "tech_specs_document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tech_specs_document" ADD CONSTRAINT "tech_specs_document_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."tech_specs_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."basic_folder" ADD CONSTRAINT "basic_folder_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."basic_folder" ADD CONSTRAINT "basic_folder_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."basic_folder" ADD CONSTRAINT "basic_folder_startupFolderId_fkey" FOREIGN KEY ("startupFolderId") REFERENCES "public"."startup_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."basic_document" ADD CONSTRAINT "basic_document_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."basic_document" ADD CONSTRAINT "basic_document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."basic_document" ADD CONSTRAINT "basic_document_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."basic_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."safety_and_health_folder" ADD CONSTRAINT "safety_and_health_folder_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."safety_and_health_folder" ADD CONSTRAINT "safety_and_health_folder_startupFolderId_fkey" FOREIGN KEY ("startupFolderId") REFERENCES "public"."startup_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."safety_and_health_document" ADD CONSTRAINT "safety_and_health_document_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."safety_and_health_document" ADD CONSTRAINT "safety_and_health_document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."safety_and_health_document" ADD CONSTRAINT "safety_and_health_document_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."safety_and_health_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."worker_folders" ADD CONSTRAINT "worker_folders_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."worker_folders" ADD CONSTRAINT "worker_folders_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."worker_folders" ADD CONSTRAINT "worker_folders_startupFolderId_fkey" FOREIGN KEY ("startupFolderId") REFERENCES "public"."startup_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."worker_document" ADD CONSTRAINT "worker_document_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."worker_document" ADD CONSTRAINT "worker_document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."worker_document" ADD CONSTRAINT "worker_document_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."worker_folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vehicle_folders" ADD CONSTRAINT "vehicle_folders_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vehicle_folders" ADD CONSTRAINT "vehicle_folders_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vehicle_folders" ADD CONSTRAINT "vehicle_folders_startupFolderId_fkey" FOREIGN KEY ("startupFolderId") REFERENCES "public"."startup_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vehicle_document" ADD CONSTRAINT "vehicle_document_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vehicle_document" ADD CONSTRAINT "vehicle_document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vehicle_document" ADD CONSTRAINT "vehicle_document_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."vehicle_folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."environmental_folder" ADD CONSTRAINT "environmental_folder_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."environmental_folder" ADD CONSTRAINT "environmental_folder_startupFolderId_fkey" FOREIGN KEY ("startupFolderId") REFERENCES "public"."startup_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."environmental_document" ADD CONSTRAINT "environmental_document_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."environmental_document" ADD CONSTRAINT "environmental_document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."environmental_document" ADD CONSTRAINT "environmental_document_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."environmental_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."environment_folder" ADD CONSTRAINT "environment_folder_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."environment_folder" ADD CONSTRAINT "environment_folder_startupFolderId_fkey" FOREIGN KEY ("startupFolderId") REFERENCES "public"."startup_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."environment_document" ADD CONSTRAINT "environment_document_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."environment_document" ADD CONSTRAINT "environment_document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."environment_document" ADD CONSTRAINT "environment_document_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."environment_folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_request" ADD CONSTRAINT "work_request_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_request" ADD CONSTRAINT "work_request_approvalById_fkey" FOREIGN KEY ("approvalById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_request" ADD CONSTRAINT "work_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_request_comment" ADD CONSTRAINT "work_request_comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_request_comment" ADD CONSTRAINT "work_request_comment_workRequestId_fkey" FOREIGN KEY ("workRequestId") REFERENCES "public"."work_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activity_log" ADD CONSTRAINT "activity_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inspection_comment" ADD CONSTRAINT "inspection_comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inspection_comment" ADD CONSTRAINT "inspection_comment_workEntryId_fkey" FOREIGN KEY ("workEntryId") REFERENCES "public"."work_book_entry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."external_visitor" ADD CONSTRAINT "external_visitor_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."external_company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."visitor_talk" ADD CONSTRAINT "visitor_talk_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."external_company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."visitor_talk_completion" ADD CONSTRAINT "visitor_talk_completion_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "public"."external_visitor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."visitor_talk_completion" ADD CONSTRAINT "visitor_talk_completion_visitorTalkId_fkey" FOREIGN KEY ("visitorTalkId") REFERENCES "public"."visitor_talk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file_access_log" ADD CONSTRAINT "file_access_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file_access_log" ADD CONSTRAINT "file_access_log_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LaborControlFolder" ADD CONSTRAINT "LaborControlFolder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkerLaborControlFolder" ADD CONSTRAINT "WorkerLaborControlFolder_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkerLaborControlFolder" ADD CONSTRAINT "WorkerLaborControlFolder_laborControlFolderId_fkey" FOREIGN KEY ("laborControlFolderId") REFERENCES "public"."LaborControlFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LaborControlDocument" ADD CONSTRAINT "LaborControlDocument_uploadById_fkey" FOREIGN KEY ("uploadById") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LaborControlDocument" ADD CONSTRAINT "LaborControlDocument_reviewById_fkey" FOREIGN KEY ("reviewById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LaborControlDocument" ADD CONSTRAINT "LaborControlDocument_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."LaborControlFolder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkerLaborControlDocument" ADD CONSTRAINT "WorkerLaborControlDocument_uploadById_fkey" FOREIGN KEY ("uploadById") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkerLaborControlDocument" ADD CONSTRAINT "WorkerLaborControlDocument_reviewById_fkey" FOREIGN KEY ("reviewById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkerLaborControlDocument" ADD CONSTRAINT "WorkerLaborControlDocument_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."WorkerLaborControlFolder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AssignedUsers" ADD CONSTRAINT "_AssignedUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AssignedUsers" ADD CONSTRAINT "_AssignedUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."work_book_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_WorkPermitParticipants" ADD CONSTRAINT "_WorkPermitParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_WorkPermitParticipants" ADD CONSTRAINT "_WorkPermitParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."work_permit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EquipmentToWorkOrder" ADD CONSTRAINT "_EquipmentToWorkOrder_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EquipmentToWorkOrder" ADD CONSTRAINT "_EquipmentToWorkOrder_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."work_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EquipmentToWorkRequest" ADD CONSTRAINT "_EquipmentToWorkRequest_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EquipmentToWorkRequest" ADD CONSTRAINT "_EquipmentToWorkRequest_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."work_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EquipmentToLockoutPermit" ADD CONSTRAINT "_EquipmentToLockoutPermit_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EquipmentToLockoutPermit" ADD CONSTRAINT "_EquipmentToLockoutPermit_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."lockout_permit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_WorkOrderManualDocuments" ADD CONSTRAINT "_WorkOrderManualDocuments_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_WorkOrderManualDocuments" ADD CONSTRAINT "_WorkOrderManualDocuments_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."work_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ExternalVisitorToVisitorTalk" ADD CONSTRAINT "_ExternalVisitorToVisitorTalk_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."external_visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ExternalVisitorToVisitorTalk" ADD CONSTRAINT "_ExternalVisitorToVisitorTalk_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."visitor_talk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
