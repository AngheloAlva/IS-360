"use server"

import type { FolderFormSchema } from "@/lib/form-schemas/document-management/folder.schema"
import { generateSlug } from "@/lib/generateSlug"
import prisma from "@/lib/prisma"

export const createFolder = async (values: FolderFormSchema) => {
	try {
		const { parentSlug, userId, ...rest } = values

		const newFolderSlug = generateSlug(rest.name)

		let parentId: string | null = null

		// Verificar si existe una carpeta con el mismo slug en el mismo nivel
		const existingFolder = await prisma.folder.findFirst({
			where: {
				slug: newFolderSlug,
				area: rest.area,
				parentId: parentSlug ? undefined : null, // Si no hay parentSlug, buscar en carpetas raíz
			},
		})

		if (existingFolder) {
			return {
				ok: false,
				message:
					"Ya existe una carpeta con este nombre en este nivel. Intenta con otro nombre por favor",
			}
		}

		if (parentSlug) {
			const foundParent = await prisma.folder.findFirst({
				where: {
					slug: parentSlug,
					area: rest.area,
				},
				select: {
					id: true,
				},
			})

			if (!foundParent) {
				return { ok: false, message: "Carpeta padre no encontrada" }
			}

			parentId = foundParent.id
		}

		let connections: {
			user: {
				connect: {
					id: string
				}
			}
			parent?: {
				connect: {
					id: string
				}
			}
		} = {
			user: {
				connect: {
					id: userId,
				},
			},
		}

		if (parentSlug && parentId !== null) {
			connections = {
				...connections,
				parent: {
					connect: {
						id: parentId,
					},
				},
			}
		}

		const folder = await prisma.folder.create({
			data: {
				...rest,
				...connections,
				slug: newFolderSlug,
			},
		})

		return { ok: true, data: folder }
	} catch (error) {
		console.error("Error creating folder:", error)
		return { ok: false, message: "Error creating folder" }
	}
}
