"use server"

import { addDays, addMonths, addWeeks } from "date-fns"
import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES, PLAN_FREQUENCY } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const postponeTask = async ({ id }: { id: string }) => {
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
				maintenancePlan: ["update"],
			},
		},
	})

	if (!hasPermission) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const task = await prisma.maintenancePlanTask.findUnique({
			where: {
				id,
			},
		})

		if (!task) {
			return {
				ok: false,
				message: "Tarea no encontrada",
			}
		}

		let nextDate: Date

		switch (task.frequency) {
			case PLAN_FREQUENCY.DAILY:
				nextDate = addDays(task.nextDate, 1)
				break
			case PLAN_FREQUENCY.WEEKLY:
				nextDate = addWeeks(task.nextDate, 1)
				break
			case PLAN_FREQUENCY.MONTHLY:
				nextDate = addMonths(task.nextDate, 1)
				break
			case PLAN_FREQUENCY.BIMONTHLY:
				nextDate = addMonths(task.nextDate, 2)
				break
			case PLAN_FREQUENCY.QUARTERLY:
				nextDate = addMonths(task.nextDate, 3)
				break
			case PLAN_FREQUENCY.FOURMONTHLY:
				nextDate = addMonths(task.nextDate, 4)
				break
			case PLAN_FREQUENCY.BIANNUAL:
				nextDate = addMonths(task.nextDate, 6)
				break
			case PLAN_FREQUENCY.YEARLY:
				nextDate = addMonths(task.nextDate, 12)
				break
			default:
				nextDate = task.nextDate
		}

		const updatedTask = await prisma.maintenancePlanTask.update({
			where: {
				id,
			},
			data: {
				nextDate,
			},
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.MAINTENANCE_PLANS,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: updatedTask.id,
			entityType: "MaintenancePlanTask",
			metadata: {
				previousDate: task.nextDate.toISOString(),
				newDate: nextDate.toISOString(),
				frequency: task.frequency,
			},
		})

		return {
			ok: true,
			message: "Tarea pospuesta exitosamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al posponer la tarea",
		}
	}
}
