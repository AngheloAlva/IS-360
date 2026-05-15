import { Prisma } from "@/generated/prisma/client"

const workEntrySelect = {
  id: true,
  entryType: true,
  executionDate: true,
  activityName: true,
  activityStartTime: true,
  activityEndTime: true,
  comments: true,
  inspectionStatus: true,
  supervisionComments: true,
  safetyObservations: true,
  nonConformities: true,
  workOrderId: true,
  workOrder: { select: { otNumber: true } },
  milestoneId: true,
  milestone: { select: { name: true } },
  createdById: true,
  createdBy: { select: { name: true } },
  _count: { select: { assignedUsers: true, attachments: true } },
  createdAt: true,
} satisfies Prisma.WorkEntrySelect

export type WorkEntryRow = Prisma.WorkEntryGetPayload<{
  select: typeof workEntrySelect
}>

export { workEntrySelect }

export function flattenWorkEntry(row: WorkEntryRow) {
  return {
    id: row.id,
    entryType: row.entryType,
    executionDate: row.executionDate.toISOString(),
    activityName: row.activityName,
    activityStartTime: row.activityStartTime,
    activityEndTime: row.activityEndTime,
    comments: row.comments,
    inspectionStatus: row.inspectionStatus,
    supervisionComments: row.supervisionComments,
    safetyObservations: row.safetyObservations,
    nonConformities: row.nonConformities,
    workOrderId: row.workOrderId,
    workOrderOtNumber: row.workOrder.otNumber,
    milestoneId: row.milestoneId,
    milestoneName: row.milestone?.name ?? null,
    createdById: row.createdById,
    createdByName: row.createdBy.name,
    assignedUserCount: row._count.assignedUsers,
    attachmentCount: row._count.attachments,
    createdAt: row.createdAt.toISOString(),
  }
}
