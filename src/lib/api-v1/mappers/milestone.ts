import { Prisma } from "@/generated/prisma/client"

const milestoneSelect = {
  id: true,
  name: true,
  description: true,
  status: true,
  order: true,
  isCompleted: true,
  weight: true,
  startDate: true,
  endDate: true,
  approvedAt: true,
  closureComment: true,
  workOrderId: true,
  workOrder: { select: { otNumber: true } },
  requestedById: true,
  requestedBy: { select: { name: true } },
  approvedById: true,
  approvedBy: { select: { name: true } },
  _count: { select: { activities: true } },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.MilestoneSelect

export type MilestoneRow = Prisma.MilestoneGetPayload<{
  select: typeof milestoneSelect
}>

export { milestoneSelect }

export function flattenMilestone(row: MilestoneRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    order: row.order,
    isCompleted: row.isCompleted,
    weight: row.weight,
    startDate: row.startDate.toISOString(),
    endDate: row.endDate.toISOString(),
    approvedAt: row.approvedAt?.toISOString() ?? null,
    closureComment: row.closureComment,
    workOrderId: row.workOrderId,
    workOrderOtNumber: row.workOrder.otNumber,
    requestedById: row.requestedById,
    requestedByName: row.requestedBy?.name ?? null,
    approvedById: row.approvedById,
    approvedByName: row.approvedBy?.name ?? null,
    activityCount: row._count.activities,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
