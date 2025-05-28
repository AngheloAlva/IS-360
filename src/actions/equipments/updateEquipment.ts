"use server"

import prisma from "@/lib/prisma"

import type { EquipmentSchema } from "@/lib/form-schemas/admin/equipment/equipment.schema"

interface UpdateEquipmentProps {
	id: string
	values: EquipmentSchema
}

export const updateEquipment = async ({ id, values }: UpdateEquipmentProps) => {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { parentId, files, ...rest } = values

		if (parentId) {
			if (parentId === id) {
				return {
					ok: false,
					message: "Un equipo no puede ser su propio padre",
				}
			}

			const descendants = await getDescendantIds(id)
			if (descendants.includes(parentId)) {
				return {
					ok: false,
					message: "No se puede asignar como padre a un equipo que ya es descendiente",
				}
			}
		}

		const connection: {
			parent?: {
				connect?: {
					id: string
				}
				disconnect?: boolean
			}
		} = {}

		if (parentId) {
			connection.parent = {
				connect: {
					id: parentId,
				},
			}
		} else {
			connection.parent = {
				disconnect: true,
			}
		}

		await prisma.equipment.update({
			where: {
				id,
			},
			data: {
				...rest,
				...connection,
			},
		})

		return {
			ok: true,
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al actualizar el equipo",
		}
	}
}

async function getDescendantIds(equipmentId: string): Promise<string[]> {
	const children = await prisma.equipment.findMany({
		where: {
			parentId: equipmentId,
		},
		select: {
			id: true,
		},
	})

	const childIds = children.map((child) => child.id)

	if (childIds.length === 0) {
		return []
	}
	const descendantPromises = childIds.map((childId) => getDescendantIds(childId))
	const nestedDescendants = await Promise.all(descendantPromises)

	return [...childIds, ...nestedDescendants.flat()]
}
