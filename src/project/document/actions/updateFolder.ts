"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { FolderFormSchema } from "@/project/document/schemas/folder.schema"

interface UpdateFolderProps {
	id: string
	values: FolderFormSchema
}

export const updateFolder = async ({ id, values }: UpdateFolderProps) => {
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
		const currentFolder = await prisma.folder.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				slug: true,
				area: true,
				parentId: true,
				userId: true,
			},
		})

		if (!currentFolder) {
			return { ok: false, message: "Carpeta no encontrada" }
		}

		const hasPermission = await auth.api.userHasPermission({
			body: {
				userId: session.user.id,
				permissions: {
					documentation: ["update", "delete"],
				},
			},
		})

		if (currentFolder.userId !== session.user.id && !hasPermission.success) {
			return { ok: false, message: "No tienes permisos para editar esta carpeta" }
		}

		const { name, description, type, area } = values

		const updatedFolder = await prisma.folder.update({
			where: { id },
			data: {
				name,
				description,
				type,
				area,
			},
		})

  await logActivity({
			userId: session.user.id,
			module: MODULES.DOCUMENTATION,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: updatedFolder.id,
			entityType: "Folder",
			metadata: {
				name: values.name,
				slug: currentFolder.slug,
				area: values.area,
				parentId: values.parentFolderId || currentFolder.parentId,
			},
		})

		return { ok: true, data: updatedFolder }
	} catch (error) {
		console.error("Error updating folder:", error)
		return { ok: false, message: "Error al actualizar la carpeta" }
	}
}
