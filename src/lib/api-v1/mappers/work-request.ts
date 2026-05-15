import { Prisma } from "@/generated/prisma/client"

const workRequestSelect = {
  id: true,
  requestNumber: true,
  description: true,
  isUrgent: true,
  requestDate: true,
  observations: true,
  customLocation: true,
  status: true,
  workType: true,
  approvalDate: true,
  userId: true,
  user: { select: { name: true } },
  operatorId: true,
  operator: { select: { name: true } },
  approvalById: true,
  approvalBy: { select: { name: true } },
  equipments: { select: { id: true, name: true } },
  _count: { select: { workOrders: true } },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.WorkRequestSelect

export type WorkRequestRow = Prisma.WorkRequestGetPayload<{
  select: typeof workRequestSelect
}>

export { workRequestSelect }

export function flattenWorkRequest(row: WorkRequestRow) {
  return {
    id: row.id,
    requestNumber: row.requestNumber,
    description: row.description,
    isUrgent: row.isUrgent,
    requestDate: row.requestDate.toISOString(),
    observations: row.observations,
    customLocation: row.customLocation,
    status: row.status,
    workType: row.workType,
    approvalDate: row.approvalDate?.toISOString() ?? null,
    userId: row.userId,
    userName: row.user.name,
    operatorId: row.operatorId,
    operatorName: row.operator?.name ?? null,
    approvalById: row.approvalById,
    approvalByName: row.approvalBy?.name ?? null,
    equipmentIds: JSON.stringify(row.equipments.map((e: { id: string }) => e.id)),
    equipmentNames: JSON.stringify(row.equipments.map((e: { name: string }) => e.name)),
    workOrderCount: row._count.workOrders,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
