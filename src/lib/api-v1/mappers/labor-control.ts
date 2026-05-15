import { Prisma } from "@/generated/prisma/client"

const laborControlFolderSelect = {
  id: true,
  status: true,
  companyFolderStatus: true,
  emails: true,
  companyId: true,
  company: { select: { name: true } },
  _count: {
    select: {
      workerFolders: true,
      documents: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.LaborControlFolderSelect

type LaborControlFolderRow = Prisma.LaborControlFolderGetPayload<{
  select: typeof laborControlFolderSelect
}>

export { laborControlFolderSelect }
export type { LaborControlFolderRow }

export function flattenLaborControlFolder(row: LaborControlFolderRow) {
  return {
    id: row.id,
    status: row.status,
    companyFolderStatus: row.companyFolderStatus,
    emails: JSON.stringify(row.emails),
    companyId: row.companyId,
    companyName: row.company.name,
    workerFolderCount: row._count.workerFolders,
    documentCount: row._count.documents,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
