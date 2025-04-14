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
		return await prisma.$transaction(async (tx) => {
			const { workOrderId, comments, progress, ...rest } = values

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

			const newWorkEntry = await tx.workEntry.create({
				data: {
					entryType,
					hasAttachments: !!attachment,
					comments: comments || "",
					...rest,
					...workBookEntryConnectionData,
				},
			})

			const workOrder = await tx.workOrder.findUnique({
				where: { id: workOrderId },
				select: { workProgressStatus: true },
			})

			const updatedProgress = (workOrder?.workProgressStatus || 0) + Number(progress)

			await tx.workOrder.update({
				where: {
					id: workOrderId,
				},
				data: {
					workProgressStatus: updatedProgress,
				},
			})

			return {
				ok: true,
				data: newWorkEntry,
				message: "Actividad creada exitosamente",
			}
		})
	} catch (error) {
		console.error(error)

		return {
			ok: false,
			message: "Error al crear la actividad" + error,
		}
	}
}
