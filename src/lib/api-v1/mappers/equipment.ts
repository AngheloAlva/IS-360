import { Prisma } from "@/generated/prisma/client"

const equipmentSelect = {
  id: true,
  barcode: true,
  name: true,
  description: true,
  locationId: true,
  location: { select: { id: true, name: true, path: true } },
  isOperational: true,
  type: true,
  tag: true,
  criticality: true,
  parentId: true,
  parent: { select: { name: true } },
  createdById: true,
  createdBy: { select: { name: true } },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EquipmentSelect

export type EquipmentRow = Prisma.EquipmentGetPayload<{
  select: typeof equipmentSelect
}>

export { equipmentSelect }

export function flattenEquipment(row: EquipmentRow) {
  return {
    id: row.id,
    barcode: row.barcode,
    name: row.name,
    description: row.description,
    location: row.location?.path ?? "",
    isOperational: row.isOperational,
    type: row.type,
    tag: row.tag,
    criticality: row.criticality,
    parentId: row.parentId,
    parentName: row.parent?.name ?? null,
    createdById: row.createdById,
    createdByName: row.createdBy?.name ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
