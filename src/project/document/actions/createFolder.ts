"use server"

import { generateSlug } from "@/lib/generateSlug"
import prisma from "@/lib/prisma"

import type { FolderFormSchema } from "@/project/document/schemas/folder.schema"

export const createFolder = async (values: FolderFormSchema) => {
	try {
		const { parentFolderId, userId, ...rest } = values

		const newFolderSlug = generateSlug(rest.name)

		const existingFolder = await prisma.folder.findFirst({
			where: {
				area: rest.area,
				slug: newFolderSlug,
				parentId: parentFolderId || null,
			},
		})

		if (existingFolder) {
			return {
				ok: false,
				message:
					"Ya existe una carpeta con este nombre en este nivel. Intenta con otro nombre por favor",
			}
		}

		const folder = await prisma.folder.create({
			data: {
				...rest,
				...(parentFolderId && {
					parent: {
						connect: {
							id: parentFolderId,
						},
					},
				}),
				user: {
					connect: {
						id: userId,
					},
				},
				slug: newFolderSlug,
			},
		})

		return { ok: true, data: folder }
	} catch (error) {
		console.error("Error creating folder:", error)
		return { ok: false, message: "Error creating folder" }
	}
}
