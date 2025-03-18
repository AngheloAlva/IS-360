"use server"

import prisma from "@/lib/prisma"

import type { AditionalActivitySchema } from "@/lib/form-schemas/work-book/aditional-activity.schema"

interface CreateAdditionalActivityProps {
	values: AditionalActivitySchema
	attachments: string[]
	userId: string
}

export const createAdditionalActivity = async ({
	values,
	attachments,
	userId,
}: CreateAdditionalActivityProps) => {
	try {
		const { workBookId, ...rest } = values

		await prisma.workBookEntry.create({
			data: {
				entryType: "ADDITIONAL_ACTIVITY",
				hasAttachments: attachments.length > 0,
				...rest,
				workBook: {
					connect: {
						id: workBookId,
					},
				},
				attachments: {
					create: attachments.map((attachment) => ({
						type: "",
						url: attachment,
						name: attachment,
					})),
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
			message: "Actividad adicional creada exitosamente",
		}
	} catch (error) {
		console.error(error)

		return {
			ok: false,
			message: "Error al crear la actividad adicional" + error,
		}
	}
}
