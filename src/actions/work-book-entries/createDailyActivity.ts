"use server"

import prisma from "@/lib/prisma"

import type { DailyActivitySchema } from "@/lib/form-schemas/work-book/daily-activity.schema"

interface CreateDailyActivityProps {
	values: DailyActivitySchema
	attachments: string[]
	userId: string
}

export const createDailyActivity = async ({
	values,
	attachments,
	userId,
}: CreateDailyActivityProps) => {
	try {
		const { workBookId, ...rest } = values

		await prisma.workBookEntry.create({
			data: {
				entryType: "DAILY_ACTIVITY",
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
				assignedUsers: {
					connect: values.personnel.map((personnel) => ({
						id: personnel.userId,
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
			message: "Actividad diaria creada exitosamente",
		}
	} catch (error) {
		console.error(error)

		return {
			ok: false,
			message: "Error al crear la actividad diaria" + error,
		}
	}
}
