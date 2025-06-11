"use server"

import prisma from "@/lib/prisma"

import type { EquipmentSchema } from "@/lib/form-schemas/admin/equipment/equipment.schema"
import type { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import type { UploadResult } from "@/lib/upload-files"

interface CreateEquipmentProps {
	values: EquipmentSchema
	uploadResults: UploadResult[]
}

export const createEquipment = async ({ values, uploadResults }: CreateEquipmentProps) => {
	try {
		const barcode = generateBarcode()
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { parentId, files, ...rest } = values

		await prisma.equipment.create({
			data: {
				barcode,
				...(parentId && { parent: { connect: { id: parentId } } }),
				...(uploadResults.length > 0 && {
					attachments: {
						create: uploadResults.map((result) => ({
							url: result.url,
							name: result.name,
							type: result.type,
							size: result.size,
						})),
					},
				}),
				...rest,
			},
		})

		return {
			ok: true,
		}
	} catch (error) {
		if ((error as PrismaClientKnownRequestError).code === "P2002") {
			const target = (error as PrismaClientKnownRequestError).meta?.target as string[]
			const field = target[0]
			return {
				ok: false,
				message: `Ya existe un equipo con el ${field} '${values[field as keyof EquipmentSchema]}'. Este campo debe ser único.`,
			}
		}

		return {
			ok: false,
			message: "Error al crear el equipo",
		}
	}
}

const generateBarcode = () => {
	return `${Date.now()}`
}
