"use server"

import prisma from "@/lib/prisma"

import type { preventionAreaSchema } from "@/lib/form-schemas/work-book/prevention-area.schema"
import type { z } from "zod"

export const createPreventionArea = async (values: z.infer<typeof preventionAreaSchema>) => {
	try {
		const { workBookId, ...rest } = values

		await prisma.preventionArea.create({
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
			message: "Área de prevención creada exitosamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al crear el área de prevención",
		}
	}
}
