"use server"

import { PreventionAreaSchema } from "@/lib/form-schemas/work-book/prevention-area.schema"
import prisma from "@/lib/prisma"

interface CreatePreventionAreaProps {
	values: PreventionAreaSchema
	userId: string
}

export const createPreventionArea = async ({ values, userId }: CreatePreventionAreaProps) => {
	try {
		const { workBookId, ...rest } = values

		await prisma.workBookEntry.create({
			data: {
				entryType: "PREVENTION_AREA",
				others: rest.others,
				recommendations: rest.recommendations,
				executionDate: rest.initialDate,
				activityStartTime: rest.initialTime,
				comments: rest.comments,
				workBook: {
					connect: {
						id: workBookId,
					},
				},
				createdBy: {
					connect: {
						id: userId,
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
