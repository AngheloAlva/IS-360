"use server"

import type { OtcInspectionSchema } from "@/lib/form-schemas/work-book/otc-inspections.schema"
import prisma from "@/lib/prisma"

interface CreateOtcInspectionsProps {
	values: OtcInspectionSchema
	userId: string
}

export const createOtcInspections = async ({ values, userId }: CreateOtcInspectionsProps) => {
	try {
		const { workOrderId, ...rest } = values

		await prisma.workEntry.create({
			data: {
				entryType: "OTC_INSPECTION",
				...rest,
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
