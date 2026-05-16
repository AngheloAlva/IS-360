import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

export const deletePlanTask = async (taskId: string) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const now = new Date().toISOString()

		const result = await db.query<{ id: string; name: string }>(
			`UPDATE "maintenance_plan_task"
			 SET "isActive" = false, "updatedAt" = $1
			 WHERE id = $2
			 RETURNING id, name`,
			[now, taskId],
		)
		const task = result.rows[0]
		if (!task) {
			return { ok: false, message: "Tarea no encontrada" }
		}

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.MAINTENANCE_PLANS,
				action: ACTIVITY_TYPE.DELETE,
				entityId: task.id,
				entityType: "MaintenancePlanTask",
				metadata: { name: task.name },
			})
		} catch {
			// audit best-effort
		}

		return { ok: true, message: `Tarea: ${task.name} eliminada correctamente` }
	} catch (error) {
		console.error("[DELETE_PLAN_TASK]", error)
		return { ok: false, message: `Error al eliminar la tarea: ${error}` }
	}
}
