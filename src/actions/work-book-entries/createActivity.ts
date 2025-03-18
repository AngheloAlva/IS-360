"use server"

import prisma from "@/lib/prisma"

import type { DailyActivitySchema } from "@/lib/form-schemas/work-book/daily-activity.schema"
import type { ENTRY_TYPE } from "@prisma/client"

interface CreateActivityProps {
	userId: string
	entryType: ENTRY_TYPE
	attachments?: string[]
	values: DailyActivitySchema
}

export const createActivity = async ({
	values,
	userId,
	entryType,
	attachments,
}: CreateActivityProps) => {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { workBookId, comments, personnel, ...rest } = values

		const workBookEntryConnectionData: {
			workBook: { connect: { id: string } }
			assignedUsers: {
				connect: {
					id: string
				}[]
			}
			createdBy: { connect: { id: string } }
			attachments?: { create: { type: string; url: string; name: string }[] }
		} = {
			workBook: {
				connect: {
					id: workBookId,
				},
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
		}

		if (attachments?.length) {
			workBookEntryConnectionData.attachments = {
				create: attachments.map((attachment) => ({
					type: "",
					url: attachment,
					name: attachment,
				})),
			}
		}

		await prisma.workBookEntry.create({
			data: {
				entryType,
				hasAttachments: !!attachments?.length,
				comments: comments || "",
				...rest,
				...workBookEntryConnectionData,
			},
		})

		return {
			ok: true,
			message: "Actividad creada exitosamente",
		}
	} catch (error) {
		console.error(error)

		return {
			ok: false,
			message: "Error al crear la actividad" + error,
		}
	}
}
