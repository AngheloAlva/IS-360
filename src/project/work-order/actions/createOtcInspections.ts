"use server"

import { headers } from "next/headers"

import { UploadResult as UploadFilesResult } from "@/lib/upload-files"
import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { OtcInspectionSchema } from "@/project/work-order/schemas/otc-inspections.schema"

interface CreateOtcInspectionsProps {
	userId: string
	values: OtcInspectionSchema
	attachment?: UploadFilesResult[]
}

export const createOtcInspections = async ({
	values,
	userId,
	attachment,
}: CreateOtcInspectionsProps) => {
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
		const { workOrderId, progress, ...rest } = values

		const workBookEntryConnectionData: {
			workOrder: { connect: { id: string } }
			createdBy: { connect: { id: string } }
			attachments?: { create: { type: string; url: string; name: string }[] }
		} = {
			workOrder: {
				connect: {
					id: workOrderId,
				},
			},
			createdBy: {
				connect: {
					id: userId,
				},
			},
		}

		if (attachment) {
			workBookEntryConnectionData.attachments = {
				create: attachment.map((attachment) => ({
					type: attachment.type,
					url: attachment.url,
					name: attachment.name,
				})),
			}
		}

		return await prisma.$transaction(async (tx) => {
			const newWorkEntry = await tx.workEntry.create({
				data: {
					entryType: "OTC_INSPECTION",
					...rest,
					...workBookEntryConnectionData,
				},
				select: {
					id: true,
					entryType: true,
					nonConformities: true,
					workOrderId: true,
					createdById: true,
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
					workName: true,
					type: true,
					workProgressStatus: true,
					equipment: {
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

			const updatedProgress = (workOrder.workProgressStatus || 0) + Number(progress || 0)

			const updatedWorkOrder = await tx.workOrder.update({
				where: {
					id: workOrderId,
				},
				data: {
					workProgressStatus: updatedProgress,
				},
				select: {
					id: true,
					status: true,
					otNumber: true,
					workName: true,
					workProgressStatus: true,
				},
			})

			const equipmentHistories = await Promise.all(
				workOrder.equipment.map(async (equipment) => {
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
							description: rest.nonConformities || "",
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
					nonConformities: newWorkEntry.nonConformities,
					attachments: newWorkEntry.attachments,
					workOrderId: newWorkEntry.workOrderId,
					createdById: newWorkEntry.createdById,
					workOrderStatus: updatedWorkOrder.status,
					otNumber: updatedWorkOrder.otNumber,
					workName: updatedWorkOrder.workName,
					workProgressStatus: updatedWorkOrder.workProgressStatus,
					companyId: workOrder.company?.id,
					companyName: workOrder.company?.name,
					equipmentHistories,
				},
			})

			return {
				ok: true,
				message: "Inspector creado exitosamente",
			}
		})
	} catch (error) {
		console.error("[CREATE_OTC_INSPECTION]", error)
		return {
			ok: false,
			message: "Error al crear el inspector",
		}
	}
}
