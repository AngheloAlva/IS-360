"use server"

import prisma from "@/lib/prisma"
import { PLAN_FREQUENCY } from "@prisma/client"
import { addDays, addMonths, addWeeks } from "date-fns"

export const postponeTask = async ({ id }: { id: string }) => {
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

		await prisma.maintenancePlanTask.update({
			where: {
				id,
			},
			data: {
				nextDate,
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
