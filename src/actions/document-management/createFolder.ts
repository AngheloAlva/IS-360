"use server"

import type { FolderFormSchema } from "@/lib/form-schemas/document-management/folder.schema"
import prisma from "@/lib/prisma"

export const createFolder = async (values: FolderFormSchema) => {
	try {
		const { parentSlug, userId, ...rest } = values

		let parentId: string | null = null

		if (parentSlug) {
			const foundParentId = await prisma.folder.findFirst({
				where: {
					slug: parentSlug,
					area: rest.area,
				},
				select: {
					id: true,
				},
			})

			if (!foundParentId) {
				return { ok: false, message: "Parent folder not found" }
			}

			parentId = foundParentId.id
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
				slug: rest.name
					.toLowerCase()
					.replace(/\s+/g, "-")
					.replace(/[^a-z0-9-]/g, ""),
			},
		})

		return { ok: true, data: folder }
	} catch (error) {
		console.error("Error creating folder:", error)
		return { ok: false, message: "Error creating folder" }
	}
}
