"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { EquipmentSchema } from "@/project/equipment/schemas/equipment.schema"

interface UpdateEquipmentProps {
	id: string
	values: EquipmentSchema
}

export const updateEquipment = async ({ id, values }: UpdateEquipmentProps) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permission: {
				equipment: ["update"],
			},
		},
	})

	if (!hasPermission) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const { parentId, files = [], ...rest } = values

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

		// Obtener los attachments actuales del equipo
		const currentAttachments = await prisma.attachment.findMany({
			where: { equipment: { id } },
			select: { id: true, url: true, name: true, type: true },
		})

		// Identificar qué archivos mantener (ya existentes) y cuáles son nuevos
		const existingFileUrls = files
			.filter((file) => !file.file) // Sin la propiedad file son archivos ya guardados
			.map((file) => file.url)

		// IDs de adjuntos a eliminar (los que ya no están en la lista de archivos)
		const attachmentsToDelete = currentAttachments
			.filter((attachment) => !existingFileUrls.includes(attachment.url))
			.map((attachment) => attachment.id)

		// Crear nuevos adjuntos para los archivos nuevos
		const newAttachments = files
			.filter((file) => !file.file && !currentAttachments.some((att) => att.url === file.url))
			.map((file) => ({
				url: file.url,
				name: file.title,
				type: file.type,
				size: file.fileSize,
			}))

		// Actualizar el equipo con todos los cambios
		await prisma.$transaction(async (tx) => {
			// Actualizar equipo
			const updatedEquipment = await tx.equipment.update({
				where: { id },
				data: {
					...rest,
					...connection,
					// Agregar nuevos attachments si existen
					...(newAttachments.length > 0 && {
						attachments: {
							create: newAttachments,
						},
					}),
				},
			})

			// Eliminar attachments que ya no están en la lista
			if (attachmentsToDelete.length > 0) {
				await tx.attachment.deleteMany({
					where: {
						id: { in: attachmentsToDelete },
					},
				})
			}

			logActivity({
				userId: session.user.id,
				module: MODULES.EQUIPMENT,
				action: ACTIVITY_TYPE.UPDATE,
				entityId: updatedEquipment.id,
				entityType: "Equipment",
				metadata: {
					name: updatedEquipment.name,
					barcode: updatedEquipment.barcode,
					oldParentId: updatedEquipment.parentId,
					newParentId: parentId,
					attachmentsAdded: newAttachments.length,
					attachmentsRemoved: attachmentsToDelete.length,
				},
			})
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
