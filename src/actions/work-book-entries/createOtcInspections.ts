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
		const { workOrderId, ...rest } = values

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

		await prisma.workEntry.create({
			data: {
				entryType: "OTC_INSPECTION",
				...rest,
				...workBookEntryConnectionData,
			},
		})

		return {
			ok: true,
			message: "Inspector creado exitosamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al crear el inspector",
		}
	}
}
