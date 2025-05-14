"use server"

import { UploadResult as UploadFileResult } from "@/lib/upload-files"
import prisma from "@/lib/prisma"

import type { DailyActivitySchema } from "@/lib/form-schemas/work-book/daily-activity.schema"
import type { ENTRY_TYPE } from "@prisma/client"

interface CreateActivityProps {
	userId: string
	entryType: ENTRY_TYPE
	values: DailyActivitySchema
	attachment?: UploadFileResult[]
}

export const createActivity = async ({
	values,
	userId,
	entryType,
	attachment,
}: CreateActivityProps) => {
	try {
		return await prisma.$transaction(async (tx) => {
			const { workOrderId, milestoneId, comments, personnel, ...rest } = values

			const newWorkEntry = await tx.workEntry.create({
				data: {
					...rest,
					entryType,
					hasAttachments: !!attachment,
					comments: comments || "",
					workOrder: {
						connect: {
							id: workOrderId,
						},
					},
					milestone: {
						connect: {
							id: milestoneId,
						},
					},
					createdBy: {
						connect: {
							id: userId,
						},
					},
					assignedUsers: {
						connect: personnel.map((personnel) => ({
							id: personnel.userId,
						})),
					},
					...(attachment && {
						attachments: {
							create: attachment.map((attachment) => ({
								type: attachment.type,
								url: attachment.url,
								name: attachment.name,
							})),
						},
					}),
				},
			})

			const workOrder = await tx.workOrder.findUnique({
				where: { id: workOrderId },
				include: {
					equipment: {
						select: {
							id: true,
						},
					},
				},
			})

			await tx.workOrder.update({
				where: {
					id: workOrderId,
				},
				data: {
					status: "IN_PROGRESS",
				},
			})

			await tx.milestone.update({
				where: {
					id: milestoneId,
				},
				data: {
					status: "IN_PROGRESS",
				},
			})

			workOrder?.equipment.forEach(async (equipment) => {
				await tx.equipmentHistory.create({
					data: {
						equipment: {
							connect: {
								id: equipment.id,
							},
						},
						workEntry: {
							connect: {
								id: newWorkEntry.id,
							},
						},
						changeType: workOrder?.type || "",
						description: rest.activityName,
						status: "",
						modifiedBy: {
							connect: {
								id: userId,
							},
						},
					},
				})
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
