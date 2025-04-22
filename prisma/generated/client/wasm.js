
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  emailVerified: 'emailVerified',
  image: 'image',
  phone: 'phone',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  role: 'role',
  internalRole: 'internalRole',
  area: 'area',
  banned: 'banned',
  banReason: 'banReason',
  banExpires: 'banExpires',
  rut: 'rut',
  twoFactorEnabled: 'twoFactorEnabled',
  companyId: 'companyId',
  isSupervisor: 'isSupervisor'
};

exports.Prisma.TwoFactorScalarFieldEnum = {
  id: 'id',
  secret: 'secret',
  backupCodes: 'backupCodes',
  userId: 'userId'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  expiresAt: 'expiresAt',
  token: 'token',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  userId: 'userId',
  impersonatedBy: 'impersonatedBy'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  accountId: 'accountId',
  providerId: 'providerId',
  userId: 'userId',
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  idToken: 'idToken',
  accessTokenExpiresAt: 'accessTokenExpiresAt',
  refreshTokenExpiresAt: 'refreshTokenExpiresAt',
  scope: 'scope',
  password: 'password',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CompanyScalarFieldEnum = {
  id: 'id',
  name: 'name',
  rut: 'rut',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VehicleScalarFieldEnum = {
  id: 'id',
  plate: 'plate',
  model: 'model',
  year: 'year',
  brand: 'brand',
  type: 'type',
  color: 'color',
  isMain: 'isMain',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  companyId: 'companyId'
};

exports.Prisma.VerificationScalarFieldEnum = {
  id: 'id',
  identifier: 'identifier',
  value: 'value',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WorkOrderScalarFieldEnum = {
  id: 'id',
  otNumber: 'otNumber',
  type: 'type',
  status: 'status',
  solicitationDate: 'solicitationDate',
  solicitationTime: 'solicitationTime',
  workRequest: 'workRequest',
  workDescription: 'workDescription',
  priority: 'priority',
  capex: 'capex',
  programDate: 'programDate',
  estimatedHours: 'estimatedHours',
  estimatedDays: 'estimatedDays',
  requiresBreak: 'requiresBreak',
  breakDays: 'breakDays',
  estimatedEndDate: 'estimatedEndDate',
  isWorkBook: 'isWorkBook',
  workName: 'workName',
  workLocation: 'workLocation',
  workStartDate: 'workStartDate',
  workProgressStatus: 'workProgressStatus',
  companyId: 'companyId',
  supervisorId: 'supervisorId',
  responsibleId: 'responsibleId',
  initReportId: 'initReportId',
  endReportId: 'endReportId',
  closureRequestedById: 'closureRequestedById',
  closureRequestedAt: 'closureRequestedAt',
  closureApprovedById: 'closureApprovedById',
  closureApprovedAt: 'closureApprovedAt',
  closureRejectedReason: 'closureRejectedReason',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EquipmentScalarFieldEnum = {
  id: 'id',
  barcode: 'barcode',
  name: 'name',
  description: 'description',
  location: 'location',
  isOperational: 'isOperational',
  type: 'type',
  tag: 'tag',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  parentId: 'parentId'
};

exports.Prisma.WorkApplicationScalarFieldEnum = {
  id: 'id',
  description: 'description',
  location: 'location',
  status: 'status',
  criticality: 'criticality',
  responsibleId: 'responsibleId'
};

exports.Prisma.WorkEntryScalarFieldEnum = {
  id: 'id',
  entryType: 'entryType',
  isFavorite: 'isFavorite',
  hasAttachments: 'hasAttachments',
  executionDate: 'executionDate',
  activityName: 'activityName',
  activityStartTime: 'activityStartTime',
  activityEndTime: 'activityEndTime',
  comments: 'comments',
  supervisionComments: 'supervisionComments',
  safetyObservations: 'safetyObservations',
  nonConformities: 'nonConformities',
  inspectorName: 'inspectorName',
  recommendations: 'recommendations',
  others: 'others',
  noteStatus: 'noteStatus',
  notificationSent: 'notificationSent',
  acknowledgedAt: 'acknowledgedAt',
  resolvedAt: 'resolvedAt',
  approvalStatus: 'approvalStatus',
  approvalDate: 'approvalDate',
  approvalById: 'approvalById',
  createdAt: 'createdAt',
  createdById: 'createdById',
  signedAt: 'signedAt',
  signedById: 'signedById',
  workOrderId: 'workOrderId',
  referencedEntryId: 'referencedEntryId'
};

exports.Prisma.WorkTrackerScalarFieldEnum = {
  id: 'id',
  description: 'description',
  date: 'date',
  dedicatedHours: 'dedicatedHours',
  quantityPersons: 'quantityPersons',
  location: 'location',
  status: 'status',
  userId: 'userId',
  otNumberId: 'otNumberId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AttachmentScalarFieldEnum = {
  id: 'id',
  name: 'name',
  url: 'url',
  type: 'type',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  workApplicationId: 'workApplicationId',
  workEntryId: 'workEntryId',
  workTrackerId: 'workTrackerId',
  initReportId: 'initReportId',
  endReportId: 'endReportId'
};

exports.Prisma.WorkPermitScalarFieldEnum = {
  id: 'id',
  aplicantPt: 'aplicantPt',
  responsiblePt: 'responsiblePt',
  executanCompany: 'executanCompany',
  mutuality: 'mutuality',
  otherMutuality: 'otherMutuality',
  initDate: 'initDate',
  endDate: 'endDate',
  hour: 'hour',
  workersNumber: 'workersNumber',
  workDescription: 'workDescription',
  exactPlace: 'exactPlace',
  workWillBe: 'workWillBe',
  workWillBeOther: 'workWillBeOther',
  tools: 'tools',
  otherTools: 'otherTools',
  preChecks: 'preChecks',
  otherPreChecks: 'otherPreChecks',
  activityDetails: 'activityDetails',
  riskIdentification: 'riskIdentification',
  otherRisk: 'otherRisk',
  preventiveControlMeasures: 'preventiveControlMeasures',
  otherPreventiveControlMeasures: 'otherPreventiveControlMeasures',
  generateWaste: 'generateWaste',
  wasteType: 'wasteType',
  wasteDisposalLocation: 'wasteDisposalLocation',
  whoDeliversWorkAreaOp: 'whoDeliversWorkAreaOp',
  workerExecutor: 'workerExecutor',
  preventionOfficer: 'preventionOfficer',
  whoReceives: 'whoReceives',
  cleanAndTidyWorkArea: 'cleanAndTidyWorkArea',
  workCompleted: 'workCompleted',
  observations: 'observations',
  additionalObservations: 'additionalObservations',
  acceptTerms: 'acceptTerms',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  otNumberId: 'otNumberId',
  userId: 'userId',
  companyId: 'companyId'
};

exports.Prisma.FolderScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  name: 'name',
  description: 'description',
  root: 'root',
  area: 'area',
  type: 'type',
  isExternal: 'isExternal',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  parentId: 'parentId',
  userId: 'userId'
};

exports.Prisma.FileScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  description: 'description',
  area: 'area',
  type: 'type',
  size: 'size',
  url: 'url',
  registrationDate: 'registrationDate',
  expirationDate: 'expirationDate',
  revisionCount: 'revisionCount',
  isExternal: 'isExternal',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  folderId: 'folderId',
  rootFolderId: 'rootFolderId',
  userId: 'userId'
};

exports.Prisma.FileCommentScalarFieldEnum = {
  id: 'id',
  title: 'title',
  content: 'content',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId',
  fileId: 'fileId'
};

exports.Prisma.CounterScalarFieldEnum = {
  id: 'id',
  value: 'value'
};

exports.Prisma.SafetyTalkScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  title: 'title',
  description: 'description',
  isPresential: 'isPresential',
  expiresAt: 'expiresAt',
  timeLimit: 'timeLimit',
  minimumScore: 'minimumScore',
  pdfGenerations: 'pdfGenerations',
  lastPdfGeneration: 'lastPdfGeneration',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SafetyTalkResourceScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  type: 'type',
  url: 'url',
  fileSize: 'fileSize',
  mimeType: 'mimeType',
  order: 'order',
  safetyTalkId: 'safetyTalkId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.QuestionScalarFieldEnum = {
  id: 'id',
  type: 'type',
  question: 'question',
  imageUrl: 'imageUrl',
  description: 'description',
  safetyTalkId: 'safetyTalkId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.QuestionOptionScalarFieldEnum = {
  id: 'id',
  text: 'text',
  isCorrect: 'isCorrect',
  zoneLabel: 'zoneLabel',
  zoneId: 'zoneId',
  order: 'order',
  questionId: 'questionId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserSafetyTalkScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  safetyTalkId: 'safetyTalkId',
  score: 'score',
  passed: 'passed',
  completedAt: 'completedAt',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserSafetyTalkAnswerScalarFieldEnum = {
  id: 'id',
  userSafetyTalkId: 'userSafetyTalkId',
  questionId: 'questionId',
  selectedOptionId: 'selectedOptionId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AttachmentHistoryScalarFieldEnum = {
  id: 'id',
  attachmentId: 'attachmentId',
  previousUrl: 'previousUrl',
  previousName: 'previousName',
  userId: 'userId',
  modifiedAt: 'modifiedAt',
  reason: 'reason'
};

exports.Prisma.FileHistoryScalarFieldEnum = {
  id: 'id',
  fileId: 'fileId',
  previousUrl: 'previousUrl',
  previousName: 'previousName',
  userId: 'userId',
  modifiedAt: 'modifiedAt',
  reason: 'reason'
};

exports.Prisma.EquipmentHistoryScalarFieldEnum = {
  id: 'id',
  equipmentId: 'equipmentId',
  changeType: 'changeType',
  description: 'description',
  userId: 'userId',
  modifiedAt: 'modifiedAt',
  status: 'status',
  createdAt: 'createdAt',
  workOrderId: 'workOrderId',
  workEntryId: 'workEntryId'
};

exports.Prisma.RootFolderScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  name: 'name',
  description: 'description',
  type: 'type',
  isRoot: 'isRoot',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  parentId: 'parentId',
  userId: 'userId',
  companyId: 'companyId'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.USER_ROLE = exports.$Enums.USER_ROLE = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  OPERATOR: 'OPERATOR',
  SUPERVISOR: 'SUPERVISOR',
  PARTNER_COMPANY: 'PARTNER_COMPANY'
};

exports.OTC_INTERNAL_ROLE = exports.$Enums.OTC_INTERNAL_ROLE = {
  GENERAL_SUPERVISOR: 'GENERAL_SUPERVISOR',
  AREA_SUPERVISOR: 'AREA_SUPERVISOR',
  PREVENTION_OFFICER: 'PREVENTION_OFFICER',
  OPERATIONS_MANAGER: 'OPERATIONS_MANAGER',
  MAINTENANCE_SUPERVISOR: 'MAINTENANCE_SUPERVISOR',
  ENVIRONMENTAL_SUPERVISOR: 'ENVIRONMENTAL_SUPERVISOR',
  QUALITY_SUPERVISOR: 'QUALITY_SUPERVISOR',
  NONE: 'NONE'
};

exports.AREAS = exports.$Enums.AREAS = {
  OPERATIONS: 'OPERATIONS',
  INSTRUCTIONS: 'INSTRUCTIONS',
  INTEGRITY_AND_MAINTENANCE: 'INTEGRITY_AND_MAINTENANCE',
  ENVIRONMENT: 'ENVIRONMENT',
  OPERATIONAL_SAFETY: 'OPERATIONAL_SAFETY',
  QUALITY_AND_OPERATIONAL_EXCELLENCE: 'QUALITY_AND_OPERATIONAL_EXCELLENCE',
  REGULATORY_COMPLIANCE: 'REGULATORY_COMPLIANCE',
  LEGAL: 'LEGAL',
  COMMUNITIES: 'COMMUNITIES',
  PROJECTS: 'PROJECTS'
};

exports.VEHICLE_TYPE = exports.$Enums.VEHICLE_TYPE = {
  CAR: 'CAR',
  TRUCK: 'TRUCK',
  MOTORCYCLE: 'MOTORCYCLE',
  BUS: 'BUS',
  TRACTOR: 'TRACTOR',
  TRAILER: 'TRAILER',
  OTHER: 'OTHER'
};

exports.WORK_ORDER_TYPE = exports.$Enums.WORK_ORDER_TYPE = {
  CORRECTIVE: 'CORRECTIVE',
  PREVENTIVE: 'PREVENTIVE',
  PREDICTIVE: 'PREDICTIVE',
  PROACTIVE: 'PROACTIVE'
};

exports.WORK_ORDER_STATUS = exports.$Enums.WORK_ORDER_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  CLOSURE_REQUESTED: 'CLOSURE_REQUESTED',
  CLOSED: 'CLOSED',
  EXPIRED: 'EXPIRED'
};

exports.WORK_ORDER_PRIORITY = exports.$Enums.WORK_ORDER_PRIORITY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
};

exports.WORK_ORDER_CAPEX = exports.$Enums.WORK_ORDER_CAPEX = {
  CONFIDABILITY: 'CONFIDABILITY',
  MITIGATE_RISK: 'MITIGATE_RISK',
  COMPLIANCE: 'COMPLIANCE'
};

exports.WORK_APPLICATION_STATUS = exports.$Enums.WORK_APPLICATION_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
};

exports.ENTRY_TYPE = exports.$Enums.ENTRY_TYPE = {
  DAILY_ACTIVITY: 'DAILY_ACTIVITY',
  ADDITIONAL_ACTIVITY: 'ADDITIONAL_ACTIVITY',
  PREVENTION_AREA: 'PREVENTION_AREA',
  OTC_INSPECTION: 'OTC_INSPECTION',
  COMMENT: 'COMMENT',
  USER_NOTE: 'USER_NOTE'
};

exports.NOTE_STATUS = exports.$Enums.NOTE_STATUS = {
  PENDING: 'PENDING',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  RESOLVED: 'RESOLVED'
};

exports.APPROVAL_STATUS = exports.$Enums.APPROVAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

exports.WORK_PERMIT_STATUS = exports.$Enums.WORK_PERMIT_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
};

exports.RESOURCE_TYPE = exports.$Enums.RESOURCE_TYPE = {
  VIDEO: 'VIDEO',
  PRESENTATION: 'PRESENTATION',
  DOCUMENT: 'DOCUMENT'
};

exports.QUESTION_TYPE = exports.$Enums.QUESTION_TYPE = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  IMAGE_ZONES: 'IMAGE_ZONES',
  TRUE_FALSE: 'TRUE_FALSE',
  SHORT_ANSWER: 'SHORT_ANSWER'
};

exports.ROOT_FOLDER_TYPE = exports.$Enums.ROOT_FOLDER_TYPE = {
  COMPANY_INFORMATION: 'COMPANY_INFORMATION',
  RISK_PREVENTION: 'RISK_PREVENTION',
  WORK_PROCEDURES: 'WORK_PROCEDURES',
  PERSONNEL_DOCUMENTS: 'PERSONNEL_DOCUMENTS',
  OCCUPATIONAL_EXAMS: 'OCCUPATIONAL_EXAMS',
  INTERNAL_REGULATIONS: 'INTERNAL_REGULATIONS',
  INFORMATION_DUTIES: 'INFORMATION_DUTIES',
  PPE_DELIVERY: 'PPE_DELIVERY',
  PPE_CERTIFICATES: 'PPE_CERTIFICATES',
  VEHICLES: 'VEHICLES',
  SAFETY_ADVISOR: 'SAFETY_ADVISOR',
  LEGAL: 'LEGAL'
};

exports.Prisma.ModelName = {
  User: 'User',
  TwoFactor: 'TwoFactor',
  Session: 'Session',
  Account: 'Account',
  Company: 'Company',
  Vehicle: 'Vehicle',
  Verification: 'Verification',
  WorkOrder: 'WorkOrder',
  Equipment: 'Equipment',
  WorkApplication: 'WorkApplication',
  WorkEntry: 'WorkEntry',
  WorkTracker: 'WorkTracker',
  Attachment: 'Attachment',
  WorkPermit: 'WorkPermit',
  Folder: 'Folder',
  File: 'File',
  FileComment: 'FileComment',
  Counter: 'Counter',
  SafetyTalk: 'SafetyTalk',
  SafetyTalkResource: 'SafetyTalkResource',
  Question: 'Question',
  QuestionOption: 'QuestionOption',
  UserSafetyTalk: 'UserSafetyTalk',
  UserSafetyTalkAnswer: 'UserSafetyTalkAnswer',
  AttachmentHistory: 'AttachmentHistory',
  FileHistory: 'FileHistory',
  EquipmentHistory: 'EquipmentHistory',
  RootFolder: 'RootFolder'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
