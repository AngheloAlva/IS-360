import { addDays } from "date-fns"

import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

interface UpdateTaskScheduleProps {
	taskId: string
	deltaDays: number
}

export async function updateTaskSchedule({ taskId, deltaDays }: UpdateTaskScheduleProps) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()

		const taskResult = await db.query<{ nextDate: string }>(
			`SELECT "nextDate" FROM "maintenance_plan_task" WHERE id = $1`,
			[taskId],
		)
		const task = taskResult.rows[0]
		if (!task) {
			return { ok: false, message: "Tarea no encontrada" }
		}

		const newNextDate = addDays(new Date(task.nextDate), deltaDays)
		const newOriginalDay = newNextDate.getDate()
		const now = new Date().toISOString()

		await db.query(
			`UPDATE "maintenance_plan_task"
			 SET "nextDate" = $1, "originalDayOfMonth" = $2, "updatedAt" = $3
			 WHERE id = $4`,
			[newNextDate.toISOString(), newOriginalDay, now, taskId],
		)

		return { ok: true, message: "Fecha actualizada" }
	} catch (error) {
		console.error("[UPDATE_TASK_SCHEDULE]", error)
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Error al actualizar fecha",
		}
	}
}
