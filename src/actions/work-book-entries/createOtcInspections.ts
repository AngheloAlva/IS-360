"use server"

import type { OtcInspectionSchema } from "@/lib/form-schemas/work-book/otc-inspections.schema"
import prisma from "@/lib/prisma"

interface CreateOtcInspectionsProps {
	userId: string
	values: OtcInspectionSchema
	attachment?: {
		fileType: string
		fileUrl: string
		name: string
	}
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
				create: [
					{
						type: attachment.fileType,
						url: attachment.fileUrl,
						name: attachment.name,
					},
				],
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
				select: { workProgressStatus: true, type: true },
				include: {
					equipment: {
						select: {
							id: true,
						},
					},
				},
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
