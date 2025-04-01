"use server"

import prisma from "@/lib/prisma"

import type { EquipmentSchema } from "@/lib/form-schemas/admin/equipment/equipment.schema"

interface CreateEquipmentProps {
	values: EquipmentSchema
}

export const createEquipment = async ({ values }: CreateEquipmentProps) => {
	try {
		const barcode = generateBarcode()
		const { parentId, ...rest } = values

		const connection: {
			parent?: {
				connect: {
					id: string
				}
			}
		} = {}

		if (parentId) {
			connection.parent = {
				connect: {
					id: parentId,
				},
			}
		}

		await prisma.equipment.create({
			data: {
				...rest,
				...connection,
				barcode,
			},
		})

		return {
			ok: true,
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al crear el equipo",
		}
	}
}

const generateBarcode = () => {
	return `${Date.now()}`
}
