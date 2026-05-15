import { Prisma } from "@/generated/prisma/client"

const maintenancePlanTaskSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  isActive: true,
  frequency: true,
  nextDate: true,
  isAutomated: true,
  automatedCompanyId: true,
  automatedResponsibleId: true,
  automatedSupervisorId: true,
  automatedWorkOrderType: true,
  automatedPriority: true,
  automatedCapex: true,
  automatedEstimatedDays: true,
  automatedEstimatedHours: true,
  automatedDaysInAdvance: true,
  automatedWorkDescription: true,
  maintenancePlanId: true,
  maintenancePlan: {
    select: {
      id: true,
      name: true,
      isActive: true,
      createdBy: { select: { name: true } },
    },
  },
  equipments: { select: { id: true, name: true } },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.MaintenancePlanTaskSelect

export type MaintenancePlanTaskRow = Prisma.MaintenancePlanTaskGetPayload<{
  select: typeof maintenancePlanTaskSelect
}>

export { maintenancePlanTaskSelect }

export function flattenMaintenancePlanTask(row: MaintenancePlanTaskRow) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    isActive: row.isActive,
    frequency: row.frequency,
    nextDate: row.nextDate.toISOString(),
    isAutomated: row.isAutomated,
    automatedCompanyId: row.automatedCompanyId,
    automatedResponsibleId: row.automatedResponsibleId,
    automatedSupervisorId: row.automatedSupervisorId,
    automatedWorkOrderType: row.automatedWorkOrderType,
    automatedPriority: row.automatedPriority,
    automatedCapex: row.automatedCapex,
    automatedEstimatedDays: row.automatedEstimatedDays,
    automatedEstimatedHours: row.automatedEstimatedHours,
    automatedDaysInAdvance: row.automatedDaysInAdvance,
    automatedWorkDescription: row.automatedWorkDescription,
    planId: row.maintenancePlan.id,
    planName: row.maintenancePlan.name,
    planIsActive: row.maintenancePlan.isActive,
    createdByName: row.maintenancePlan.createdBy.name,
    equipmentIds: JSON.stringify(row.equipments.map((e: { id: string }) => e.id)),
    equipmentNames: JSON.stringify(row.equipments.map((e: { name: string }) => e.name)),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
