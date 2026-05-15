import { Prisma } from "@/generated/prisma/client"

const companySelect = {
  id: true,
  name: true,
  isActive: true,
  createdById: true,
  createdBy: { select: { name: true } },
  _count: { select: { users: true, workOrders: true } },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CompanySelect

export type CompanyRow = Prisma.CompanyGetPayload<{ select: typeof companySelect }>

export { companySelect }

export function flattenCompany(row: CompanyRow) {
  return {
    id: row.id,
    name: row.name,
    isActive: row.isActive,
    createdById: row.createdById,
    createdByName: row.createdBy.name,
    userCount: row._count.users,
    workOrderCount: row._count.workOrders,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
