import { Prisma } from "@/generated/prisma/client"

const subFolderStatusSelect = {
  select: { status: true },
} as const

const startupFolderSelect = {
  id: true,
  name: true,
  type: true,
  status: true,
  moreMonthDuration: true,
  isDeleted: true,
  isArchived: true,
  archivedAt: true,
  companyId: true,
  company: { select: { name: true } },
  safetyAndHealthFolders: subFolderStatusSelect,
  environmentalFolders: subFolderStatusSelect,
  environmentFolders: subFolderStatusSelect,
  techSpecsFolders: subFolderStatusSelect,
  _count: {
    select: {
      workersFolders: true,
      vehiclesFolders: true,
      basicFolders: true,
      safetyAndHealthFolders: true,
      environmentalFolders: true,
      environmentFolders: true,
      techSpecsFolders: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.StartupFolderSelect

type StartupFolderRow = Prisma.StartupFolderGetPayload<{
  select: typeof startupFolderSelect
}>

export { startupFolderSelect }
export type { StartupFolderRow }

export function flattenStartupFolder(row: StartupFolderRow) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    status: row.status,
    moreMonthDuration: row.moreMonthDuration,
    isDeleted: row.isDeleted,
    isArchived: row.isArchived,
    archivedAt: row.archivedAt?.toISOString() ?? null,
    companyId: row.companyId,
    companyName: row.company.name,
    safetyAndHealthStatus: row.safetyAndHealthFolders[0]?.status ?? null,
    environmentalStatus: row.environmentalFolders[0]?.status ?? null,
    environmentStatus: row.environmentFolders[0]?.status ?? null,
    techSpecsStatus: row.techSpecsFolders[0]?.status ?? null,
    workerFolderCount: row._count.workersFolders,
    vehicleFolderCount: row._count.vehiclesFolders,
    basicFolderCount: row._count.basicFolders,
    safetyAndHealthFolderCount: row._count.safetyAndHealthFolders,
    environmentalFolderCount: row._count.environmentalFolders,
    environmentFolderCount: row._count.environmentFolders,
    techSpecsFolderCount: row._count.techSpecsFolders,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
