import { addDays, addMonths, addWeeks } from "date-fns"

import { ACTIVITY_TYPE, MODULES, PLAN_FREQUENCY } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

export const postponeTask = async ({ id }: { id: string }) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()

		const taskResult = await db.query<{ frequency: PLAN_FREQUENCY; nextDate: string }>(
			`SELECT frequency, "nextDate" FROM "maintenance_plan_task" WHERE id = $1`,
			[id],
		)
		const task = taskResult.rows[0]
		if (!task) {
			return { ok: false, message: "Tarea no encontrada" }
		}

		const current = new Date(task.nextDate)
		let nextDate: Date
		switch (task.frequency) {
			case PLAN_FREQUENCY.DAILY:
				nextDate = addDays(current, 1)
				break
			case PLAN_FREQUENCY.WEEKLY:
				nextDate = addWeeks(current, 1)
				break
			case PLAN_FREQUENCY.MONTHLY:
				nextDate = addMonths(current, 1)
				break
			case PLAN_FREQUENCY.BIMONTHLY:
				nextDate = addMonths(current, 2)
				break
			case PLAN_FREQUENCY.QUARTERLY:
				nextDate = addMonths(current, 3)
				break
			case PLAN_FREQUENCY.FOURMONTHLY:
				nextDate = addMonths(current, 4)
				break
			case PLAN_FREQUENCY.BIANNUAL:
				nextDate = addMonths(current, 6)
				break
			case PLAN_FREQUENCY.YEARLY:
				nextDate = addMonths(current, 12)
				break
			default:
				nextDate = current
		}

		const now = new Date().toISOString()
		await db.query(
			`UPDATE "maintenance_plan_task" SET "nextDate" = $1, "updatedAt" = $2 WHERE id = $3`,
			[nextDate.toISOString(), now, id],
		)

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.MAINTENANCE_PLANS,
				action: ACTIVITY_TYPE.UPDATE,
				entityId: id,
				entityType: "MaintenancePlanTask",
				metadata: {
					previousDate: current.toISOString(),
					newDate: nextDate.toISOString(),
					frequency: task.frequency,
				},
			})
		} catch {
			// audit best-effort
		}

		return { ok: true, message: "Tarea pospuesta exitosamente" }
	} catch (error) {
		console.error("[POSTPONE_TASK]", error)
		return { ok: false, message: "Error al posponer la tarea" }
	}
}
