"use server"

import type { otcInspectionsSchema } from "@/lib/form-schemas/work-book/otc-inspections.schema"
import prisma from "@/lib/prisma"
import type { z } from "zod"

export const createOtcInspections = async (values: z.infer<typeof otcInspectionsSchema>) => {
	try {
		const { workBookId, ...rest } = values

		await prisma.otcInspection.create({
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
			message: "Inspector creado exitosamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al crear el inspector",
		}
	}
}
