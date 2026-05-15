"use server"

import { headers } from "next/headers"
import { addDays } from "date-fns"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface UpdateTaskScheduleProps {
	taskId: string
	deltaDays: number
}

export async function updateTaskSchedule({ taskId, deltaDays }: UpdateTaskScheduleProps) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const task = await prisma.maintenancePlanTask.findUnique({
			where: { id: taskId },
			select: { nextDate: true, originalDayOfMonth: true },
		})

		if (!task) {
			return { ok: false, message: "Tarea no encontrada" }
		}

		const newNextDate = addDays(task.nextDate, deltaDays)
		const newOriginalDay = newNextDate.getDate()

		await prisma.maintenancePlanTask.update({
			where: { id: taskId },
			data: {
				nextDate: newNextDate,
				originalDayOfMonth: newOriginalDay,
			},
		})

		return { ok: true, message: "Fecha actualizada" }
	} catch (error) {
		console.error("[UPDATE_TASK_SCHEDULE]", error)
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Error al actualizar fecha",
		}
	}
}
