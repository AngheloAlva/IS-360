"use server"

import prisma from "@/lib/prisma"

import type { EquipmentSchema } from "@/lib/form-schemas/admin/equipment/equipment.schema"

interface UpdateEquipmentProps {
	id: string
	values: EquipmentSchema
}

export const updateEquipment = async ({ id, values }: UpdateEquipmentProps) => {
	try {
		const { parentId, ...rest } = values

		// Verificar que no estamos creando un ciclo en la jerarquía
		if (parentId) {
			// No permitir que un equipo sea su propio padre
			if (parentId === id) {
				return {
					ok: false,
					message: "Un equipo no puede ser su propio padre",
				}
			}

			// Verificar que el padre no sea uno de sus descendientes (evitar ciclos)
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
			// Si no hay parentId, desconectar cualquier relación padre existente
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

// Función auxiliar para obtener todos los IDs de equipos descendientes
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
	
	// Si no hay hijos, retornar array vacío
	if (childIds.length === 0) {
		return []
	}

	// Obtener todos los descendientes de los hijos
	const descendantPromises = childIds.map((childId) => getDescendantIds(childId))
	const nestedDescendants = await Promise.all(descendantPromises)
	
	// Aplanar el array de arrays y combinar con los hijos directos
	return [...childIds, ...nestedDescendants.flat()]
}
