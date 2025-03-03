"use server"

import prisma from "@/lib/prisma"

import type { aditionalActivitySchema } from "@/lib/form-schemas/work-book/aditional-activity.schema"
import type { z } from "zod"

export const createAdditionalActivity = async (values: z.infer<typeof aditionalActivitySchema>) => {
	try {
		const { workBookId, ...rest } = values

		await prisma.aditionalActivity.create({
			data: {
				...rest,
				workBook: {
					connect: {
						id: workBookId,
					},
				},
			},
		})

		return {
			ok: true,
			message: "Actividad adicional creada exitosamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al crear la actividad adicional",
		}
	}
}
