import { Prisma } from "@/generated/prisma/client"

// ─── Filter type ──────────────────────────────────────────────────────────────

export type WoFilters = {
	dateFrom: Date | null
	dateTo: Date | null
	specialty: string | null
	taskType: string | null
	equipmentId: string | null
	maintenancePlanId: string | null
}

// ─── Dynamic WHERE builder ────────────────────────────────────────────────────
// Uses Prisma.sql tagged templates — no string concatenation.
// All queries alias work_order as "wo".
// Confirmed via schema: WorkOrder has NO scalar equipmentId — relation is ONLY
// via pivot table "_EquipmentToWorkOrder" ("A" = equipment.id, "B" = work_order.id)

export function buildWoWhere(f: WoFilters): Prisma.Sql {
	const parts: Prisma.Sql[] = [Prisma.sql`wo."deletedAt" IS NULL`]

	if (f.dateFrom) parts.push(Prisma.sql`wo."programDate" >= ${f.dateFrom}`)
	if (f.dateTo) parts.push(Prisma.sql`wo."programDate" <= ${f.dateTo}`)

	if (f.equipmentId) {
		// WorkOrder has no scalar equipmentId — filter via pivot only
		parts.push(Prisma.sql`EXISTS (
			SELECT 1 FROM "_EquipmentToWorkOrder" pivot
			WHERE pivot."B" = wo.id
				AND pivot."A" = ${f.equipmentId}
		)`)
	}

	if (f.maintenancePlanId) {
		// Filter via the task→plan relation. Implicitly PREVENTIVE-only:
		// correctives have no linked maintenancePlanTaskId.
		parts.push(Prisma.sql`EXISTS (
			SELECT 1 FROM maintenance_plan_task mpt_pl
			WHERE mpt_pl.id = wo."maintenancePlanTaskId"
				AND mpt_pl."maintenancePlanId" = ${f.maintenancePlanId}
		)`)
	}

	if (f.specialty || f.taskType || f.maintenancePlanId) {
		// Forces PREVENTIVE-only implicitly (correctives have no linked plan task)
		parts.push(Prisma.sql`wo."maintenancePlanTaskId" IS NOT NULL`)
	}

	return Prisma.join(parts, " AND ")
}
