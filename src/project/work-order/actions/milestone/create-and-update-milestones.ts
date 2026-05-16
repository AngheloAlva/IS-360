import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import type { WorkBookMilestonesSchema } from "@/project/work-order/schemas/milestones.schema"

interface SaveMilestonesResponse {
	ok: boolean
	message: string
}

// TODO(iter X): full implementation — track which milestones to delete vs update, role-based locking
export async function createAndUpdateMilestones(
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

		const incomingIds = values.milestones
			.map((m) => m.id)
			.filter((id): id is string => Boolean(id))

		// Delete milestones not in payload
		if (incomingIds.length > 0) {
			const placeholders = incomingIds.map((_, i) => `$${i + 2}`).join(", ")
			await db.query(
				`DELETE FROM "milestone" WHERE "workOrderId" = $1 AND "id" NOT IN (${placeholders})`,
				[values.workOrderId, ...incomingIds]
			)
		} else {
			await db.query(`DELETE FROM "milestone" WHERE "workOrderId" = $1`, [
				values.workOrderId,
			])
		}

		for (let i = 0; i < values.milestones.length; i++) {
			const m = values.milestones[i]
			const id = m.id ?? crypto.randomUUID()
			const params = [
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
			await db.query(
				`INSERT INTO "milestone" ("id", "name", "description", "weight",
					"order", "startDate", "endDate", "workOrderId",
					"createdAt", "updatedAt")
				 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
				 ON CONFLICT ("id") DO UPDATE SET
					"name" = EXCLUDED."name",
					"description" = EXCLUDED."description",
					"weight" = EXCLUDED."weight",
					"order" = EXCLUDED."order",
					"startDate" = EXCLUDED."startDate",
					"endDate" = EXCLUDED."endDate",
					"updatedAt" = EXCLUDED."updatedAt"`,
				params
			)
		}

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_ORDERS,
				action: ACTIVITY_TYPE.UPDATE,
				entityId: values.workOrderId,
				entityType: "WorkOrderMilestones",
				metadata: { count: values.milestones.length },
			})
		} catch {
			// audit best-effort
		}

		return { ok: true, message: "Hitos guardados exitosamente" }
	} catch (error) {
		console.error("[CREATE_AND_UPDATE_MILESTONES]", error)
		return { ok: false, message: "Error al guardar los hitos" }
	}
}
