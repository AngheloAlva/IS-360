"use server"

import prisma from "@/lib/prisma"

import type { DailyActivitySchema } from "@/lib/form-schemas/work-book/daily-activity.schema"
import type { ENTRY_TYPE } from "@prisma/client"

interface CreateActivityProps {
	userId: string
	entryType: ENTRY_TYPE
	values: DailyActivitySchema
	attachment?: {
		fileType: string
		fileUrl: string
		name: string
	}
}

export const createActivity = async ({
	values,
	userId,
	entryType,
	attachment,
}: CreateActivityProps) => {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { workOrderId, comments, personnel, ...rest } = values

		const workBookEntryConnectionData: {
			workOrder: { connect: { id: string } }
			assignedUsers: {
				connect: {
					id: string
				}[]
			}
			createdBy: { connect: { id: string } }
			attachments?: { create: { type: string; url: string; name: string }[] }
		} = {
			workOrder: {
				connect: {
					id: workOrderId,
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

		if (attachment) {
			workBookEntryConnectionData.attachments = {
				create: [
					{
						type: attachment.fileType,
						url: attachment.fileUrl,
						name: attachment.name,
					},
				],
			}
		}

		const newWorkEntry = await prisma.workEntry.create({
			data: {
				entryType,
				hasAttachments: !!attachment,
				comments: comments || "",
				...rest,
				...workBookEntryConnectionData,
			},
		})

		return {
			ok: true,
			data: newWorkEntry,
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
