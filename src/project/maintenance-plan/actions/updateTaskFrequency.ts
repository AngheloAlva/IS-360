"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES, PLAN_FREQUENCY } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface UpdateTaskFrequencyProps {
	taskId: string
	frequency: PLAN_FREQUENCY
}

export async function updateTaskFrequency({ taskId, frequency }: UpdateTaskFrequencyProps) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return { ok: false, message: "No autorizado" }
	}

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permission: { maintenancePlan: ["update"] },
		},
	})

	if (!hasPermission) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const task = await prisma.maintenancePlanTask.findUnique({
			where: { id: taskId },
			select: { frequency: true },
		})

		if (!task) {
			return { ok: false, message: "Tarea no encontrada" }
		}

		await prisma.maintenancePlanTask.update({
			where: { id: taskId },
			data: { frequency },
		})

		await logActivity({
			userId: session.user.id,
			module: MODULES.MAINTENANCE_PLANS,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: taskId,
			entityType: "MaintenancePlanTask",
			metadata: {
				previousFrequency: task.frequency,
				newFrequency: frequency,
			},
		})

		return { ok: true, message: "Frecuencia actualizada" }
	} catch (error) {
		console.error("[UPDATE_TASK_FREQUENCY]", error)
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Error al actualizar frecuencia",
		}
	}
}
