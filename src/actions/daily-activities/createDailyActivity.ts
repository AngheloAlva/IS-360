"use server"

import prisma from "@/lib/prisma"

import type { dailyActivitySchema } from "@/lib/form-schemas/work-book/daily-activity.schema"
import type { z } from "zod"

export const createDailyActivity = async (values: z.infer<typeof dailyActivitySchema>) => {
	try {
		const { personnel, workBookId, ...rest } = values

		await prisma.dailyActivity.create({
			data: {
				...rest,
				personnel: {
					create: personnel,
				},
				workBook: {
					connect: {
						id: workBookId,
					},
				},
			},
		})

		return {
			ok: true,
			message: "Actividad diaria creada exitosamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al crear la actividad diaria",
		}
	}
}
