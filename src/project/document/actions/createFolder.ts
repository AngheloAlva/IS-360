"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { generateSlug } from "@/lib/generateSlug"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { FolderFormSchema } from "@/project/document/schemas/folder.schema"

export const createFolder = async (values: FolderFormSchema) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}
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

		logActivity({
			userId: session.user.id,
			module: MODULES.DOCUMENTATION,
			action: ACTIVITY_TYPE.CREATE,
			entityId: folder.id,
			entityType: "Folder",
			metadata: {
				name: folder.name,
				slug: folder.slug,
				area: folder.area,
				parentId: folder.parentId,
			},
		})

		return { ok: true, data: folder }
	} catch (error) {
		console.error("Error creating folder:", error)
		return { ok: false, message: "Error creating folder" }
	}
}
