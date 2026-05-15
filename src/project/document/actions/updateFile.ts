"use server"

import prisma from "@/lib/prisma"
import { logActivity } from "@/lib/activity/log"
import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

import type { UpdateFileSchema } from "@/project/document/schemas/update-file.schema"

interface UpdateFileParams extends Omit<UpdateFileSchema, "file"> {
	fileId: string
	url: string
	size: number
	type: string
	previousUrl: string
	previousName: string
}

export const updateFile = async ({
	url,
	size,
	type,
	name,
	fileId,
	userId: _ignoredUserId,
	description,
	previousUrl,
	previousName,
	expirationDate,
	registrationDate,
}: UpdateFileParams) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			error: "No autorizado",
		}
	}

	try {
		// Obtener el archivo actual
		const currentFile = await prisma.file.findUnique({
			where: { id: fileId },
		})

		if (!currentFile) {
			return { ok: false, error: "Archivo no encontrado" }
		}

		const hasPermission = await auth.api.userHasPermission({
			body: {
				userId: session.user.id,
				permissions: {
					documentation: ["update", "delete"],
				},
			},
		})

		if (currentFile.userId !== session.user.id && !hasPermission.success) {
			return { ok: false, error: "El usuario no tiene acceso a editar este archivo" }
		}

		const updatedFile = await prisma.file.update({
			where: { id: fileId },
			data: {
				url,
				size,
				type,
				name,
				description,
				expirationDate,
				registrationDate,
				revisionCount: { increment: 1 },
				user: {
					connect: {
						id: currentFile.userId,
					},
				},
			},
		})

		if (url === previousUrl) {
			return { ok: true, data: updatedFile }
		}

		await prisma.fileHistory.create({
			data: {
				file: {
					connect: {
						id: fileId,
					},
				},
				modifiedBy: {
					connect: {
						id: session.user.id,
					},
				},
				previousUrl,
				previousName,
			},
		})

  await logActivity({
			userId: session.user.id,
			module: MODULES.DOCUMENTATION,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: updatedFile.id,
			entityType: "File",
			metadata: {
				name,
				type,
				size,
				description,
				expirationDate: expirationDate?.toISOString(),
				registrationDate: registrationDate?.toISOString(),
				urlChanged: url !== previousUrl,
			},
		})

		return { ok: true, data: updatedFile }
	} catch (error) {
		console.error("[UPDATE_FILE]", error)
		return { ok: false, error: "Error al actualizar el archivo" }
	}
}
