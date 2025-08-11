"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const deletePlanTask = async (taskId: string) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permission: {
				maintenancePlan: ["delete"],
			},
		},
	})

	if (!hasPermission) {
		return {
			ok: false,
			message: "No tienes permisos para eliminar la tarea",
		}
	}

	try {
		const task = await prisma.maintenancePlanTask.findUnique({
			where: { id: taskId },
			select: {
				id: true,
				name: true,
				_count: {
					select: {
						workOrders: true,
					},
				},
			},
		})

		if (!task) {
			return {
				ok: false,
				message: "Tarea no encontrada",
			}
		}

		if (task._count.workOrders > 0) {
			return {
				ok: false,
				message: "No se puede eliminar la tarea ya que tiene OTs asociadas",
			}
		}

		await prisma.maintenancePlanTask.delete({
			where: { id: taskId },
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.MAINTENANCE_PLANS,
			action: ACTIVITY_TYPE.DELETE,
			entityId: task.id,
			entityType: "MaintenancePlanTask",
			metadata: {
				name: task.name,
				_count: task._count,
			},
		})

		return {
			ok: true,
			message: `Tarea: ${task.name} eliminada correctamente`,
		}
	} catch (error) {
		console.error("[DELETE_PLAN_TASK]", error)
		return {
			ok: false,
			message: `Error al eliminar la tarea: ${error}`,
		}
	}
}
