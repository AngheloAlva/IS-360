"use server"

import { headers } from "next/headers"

import { UploadResult as UploadFileResult } from "@/lib/upload-files"
import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { DailyActivitySchema } from "@/project/work-order/schemas/daily-activity.schema"
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
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		return await prisma.$transaction(async (tx) => {
			const { workOrderId, milestoneId, comments, personnel, ...rest } = values

			const newWorkEntry = await tx.workEntry.create({
				data: {
					...rest,
					entryType,
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
				select: {
					id: true,
					entryType: true,
					comments: true,
					workOrderId: true,
					milestoneId: true,
					createdById: true,
					activityName: true,
					assignedUsers: {
						select: {
							id: true,
							name: true,
						},
					},
					attachments: {
						select: {
							id: true,
							name: true,
							type: true,
							url: true,
						},
					},
				},
			})

			const workOrder = await tx.workOrder.findUnique({
				where: { id: workOrderId },
				select: {
					id: true,
					status: true,
					otNumber: true,
					workBookName: true,
					type: true,
					equipments: {
						select: {
							id: true,
							name: true,
						},
					},
					company: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			})

			if (!workOrder) {
				return {
					ok: false,
					message: "Orden de trabajo no encontrada",
				}
			}

			const updatedWorkOrder = await tx.workOrder.update({
				where: {
					id: workOrderId,
				},
				data: {
					status: "IN_PROGRESS",
				},
				select: {
					id: true,
					status: true,
					otNumber: true,
					workBookName: true,
				},
			})

			const updatedMilestone = await tx.milestone.update({
				where: {
					id: milestoneId,
				},
				data: {
					status: "IN_PROGRESS",
				},
				select: {
					id: true,
					status: true,
					name: true,
				},
			})

			const equipmentHistories = await Promise.all(
				workOrder.equipments.map(async (equipment) => {
					return await tx.equipmentHistory.create({
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
							changeType: workOrder.type || "",
							description: rest.activityName,
							status: "",
							modifiedBy: {
								connect: {
									id: userId,
								},
							},
						},
						select: {
							id: true,
							changeType: true,
							description: true,
							status: true,
							equipmentId: true,
							workEntryId: true,
							modifiedBy: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					})
				})
			)

			logActivity({
				userId: session.user.id,
				module: MODULES.WORK_ORDERS,
				action: ACTIVITY_TYPE.CREATE,
				entityId: newWorkEntry.id,
				entityType: "WorkEntry",
				metadata: {
					entryType: newWorkEntry.entryType,
					comments: newWorkEntry.comments,
					workOrderId: newWorkEntry.workOrderId,
					milestoneId: newWorkEntry.milestoneId,
					createdById: newWorkEntry.createdById,
					activityName: newWorkEntry.activityName,
					assignedUsers: newWorkEntry.assignedUsers,
					attachments: newWorkEntry.attachments,
					workOrderStatus: updatedWorkOrder.status,
					otNumber: updatedWorkOrder.otNumber,
					workBookName: updatedWorkOrder.workBookName,
					milestoneStatus: updatedMilestone.status,
					milestoneName: updatedMilestone.name,
					companyId: workOrder.company?.id,
					companyName: workOrder.company?.name,
					equipmentHistories,
				},
			})

			return {
				ok: true,
				data: newWorkEntry,
				message: "Actividad creada exitosamente",
			}
		})
	} catch (error) {
		console.error("[CREATE_ACTIVITY]", error)

		return {
			ok: false,
			message: "Error al crear la actividad",
		}
	}
}
