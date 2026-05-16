import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import type { WorkBookMilestonesSchema } from "@/project/work-order/schemas/milestones.schema"

interface SaveMilestonesResponse {
	ok: boolean
	message: string
}

// TODO(iter X): full implementation — validate weight totals on server, milestone history
export async function createMilestones(
	values: WorkBookMilestonesSchema
): Promise<SaveMilestonesResponse> {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const now = new Date().toISOString()

		const { rows: woRows } = await db.query<{ id: string }>(
			`SELECT "id" FROM "work_order" WHERE "id" = $1 AND "deletedAt" IS NULL`,
			[values.workOrderId]
		)
		if (!woRows[0]) {
			return { ok: false, message: "El libro de obras no existe" }
		}

		for (let i = 0; i < values.milestones.length; i++) {
			const m = values.milestones[i]
			const id = m.id ?? crypto.randomUUID()
			await db.query(
				`INSERT INTO "milestone" ("id", "name", "description", "weight",
					"order", "startDate", "endDate", "workOrderId",
					"createdAt", "updatedAt")
				 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)`,
				[
					id,
					m.name,
					m.description ?? null,
					Number(m.weight),
					i,
					new Date(m.startDate).toISOString(),
					new Date(m.endDate).toISOString(),
					values.workOrderId,
					now,
				]
			)
		}

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_ORDERS,
				action: ACTIVITY_TYPE.CREATE,
				entityId: values.workOrderId,
				entityType: "WorkOrderMilestones",
				metadata: { count: values.milestones.length },
			})
		} catch {
			// audit best-effort
		}

		return { ok: true, message: "Hitos creados exitosamente" }
	} catch (error) {
		console.error("[CREATE_MILESTONES]", error)
		return { ok: false, message: "Error al crear los hitos" }
	}
}
