"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import { deleteGuideDocumentSchema } from "../../schemas/guide-document.schema"

interface DeleteGuideDocumentProps {
	id: string
}

export const deleteGuideDocument = async ({ id }: DeleteGuideDocumentProps) => {
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
				startupFolder: ["delete"],
			},
		},
	})

	if (!hasPermission.success) {
		return {
			ok: false,
			message: "No tienes permiso para eliminar documentos guía",
		}
	}

	try {
		const validatedData = deleteGuideDocumentSchema.parse({ id })

		const existingDocument = await prisma.startupGuideDocument.findUnique({
			where: { id: validatedData.id },
		})

		if (!existingDocument) {
			return {
				ok: false,
				message: "Documento guía no encontrado",
			}
		}

		// Soft delete - marcamos como inactivo
		const guideDocument = await prisma.startupGuideDocument.update({
			where: { id: validatedData.id },
			data: {
				isActive: false,
			},
		})

  await logActivity({
			userId: session.user.id,
			module: MODULES.STARTUP_FOLDERS,
			action: ACTIVITY_TYPE.DELETE,
			entityId: guideDocument.id,
			entityType: "StartupGuideDocument",
			metadata: {
				name: existingDocument.name,
				visibility: existingDocument.visibility,
			},
		})

		return {
			ok: true,
			message: "Documento guía eliminado correctamente",
		}
	} catch (error) {
		console.error("Error al eliminar documento guía:", error)
		return {
			ok: false,
			message: "Error al eliminar el documento guía",
		}
	}
}
