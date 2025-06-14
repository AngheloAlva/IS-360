"use server"

import { UploadResult as UploadFilesResult } from "@/lib/upload-files"
import prisma from "@/lib/prisma"

import type { OtcInspectionSchema } from "@/features/work-order/schemas/otc-inspections.schema"

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
			})

			const workOrder = await tx.workOrder.findUnique({
				where: { id: workOrderId },
				select: { workProgressStatus: true, type: true, equipment: { select: { id: true } } },
			})

			const updatedProgress = (workOrder?.workProgressStatus || 0) + Number(progress || 0)

			await tx.workOrder.update({
				where: {
					id: workOrderId,
				},
				data: {
					workProgressStatus: updatedProgress,
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
						description: rest.nonConformities || "",
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
				message: "Inspector creado exitosamente",
			}
		})
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al crear el inspector",
		}
	}
}
