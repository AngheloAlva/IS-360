import { Prisma } from "@/generated/prisma/client"

const userSelect = {
  id: true,
  name: true,
  role: true,
  accessRole: true,
  internalRole: true,
  area: true,
  internalArea: true,
  isSupervisor: true,
  isActive: true,
  companyId: true,
  company: { select: { name: true } },
  allowedModules: true,
  documentAreas: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect

export type UserRow = Prisma.UserGetPayload<{ select: typeof userSelect }>

export { userSelect }

export function flattenUser(row: UserRow) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    accessRole: row.accessRole,
    internalRole: row.internalRole,
    area: row.area,
    internalArea: row.internalArea,
    isSupervisor: row.isSupervisor,
    isActive: row.isActive,
    companyId: row.companyId,
    companyName: row.company?.name ?? null,
    allowedModules: JSON.stringify(row.allowedModules),
    documentAreas: JSON.stringify(row.documentAreas),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
