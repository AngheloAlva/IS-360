"use server"

import type { OtcInspectionSchema } from "@/lib/form-schemas/work-book/otc-inspections.schema"
import prisma from "@/lib/prisma"

interface CreateOtcInspectionsProps {
	values: OtcInspectionSchema
	userId: string
}

export const createOtcInspections = async ({ values, userId }: CreateOtcInspectionsProps) => {
	try {
		const { workBookId, ...rest } = values

		await prisma.workBookEntry.create({
			data: {
				entryType: "OTC_INSPECTION",
				...rest,
				workBook: {
					connect: {
						id: workBookId,
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
