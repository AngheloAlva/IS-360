"use server"

import prisma from "@/lib/prisma"

import type { EquipmentSchema } from "@/lib/form-schemas/admin/equipment/equipment.schema"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

interface CreateEquipmentProps {
	values: EquipmentSchema
}

export const createEquipment = async ({ values }: CreateEquipmentProps) => {
	try {
		const barcode = generateBarcode()
		const { parentId, ...rest } = values

		await prisma.equipment.create({
			data: {
				barcode,
				...(parentId && { parent: { connect: { id: parentId } } }),
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
