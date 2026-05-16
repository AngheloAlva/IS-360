import { ACTIVITY_TYPE, MODULES, PLAN_FREQUENCY } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

interface UpdateTaskFrequencyProps {
	taskId: string
	frequency: PLAN_FREQUENCY
}

export async function updateTaskFrequency({ taskId, frequency }: UpdateTaskFrequencyProps) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()

		const current = await db.query<{ frequency: PLAN_FREQUENCY }>(
			`SELECT frequency FROM "maintenance_plan_task" WHERE id = $1`,
			[taskId],
		)
		if (current.rows.length === 0) {
			return { ok: false, message: "Tarea no encontrada" }
		}

		const now = new Date().toISOString()
		await db.query(
			`UPDATE "maintenance_plan_task" SET frequency = $1, "updatedAt" = $2 WHERE id = $3`,
			[frequency, now, taskId],
		)

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.MAINTENANCE_PLANS,
				action: ACTIVITY_TYPE.UPDATE,
				entityId: taskId,
				entityType: "MaintenancePlanTask",
				metadata: {
					previousFrequency: current.rows[0].frequency,
					newFrequency: frequency,
				},
			})
		} catch {
			// audit best-effort
		}

		return { ok: true, message: "Frecuencia actualizada" }
	} catch (error) {
		console.error("[UPDATE_TASK_FREQUENCY]", error)
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Error al actualizar frecuencia",
		}
	}
}
