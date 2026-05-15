"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import {
	updateGuideDocumentSchema,
	type UpdateGuideDocumentInput,
} from "../../schemas/guide-document.schema"

export const updateGuideDocument = async (data: UpdateGuideDocumentInput) => {
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
				startupFolder: ["update"],
			},
		},
	})

	if (!hasPermission.success) {
		return {
			ok: false,
			message: "No tienes permiso para actualizar documentos guía",
		}
	}

	try {
		const validatedData = updateGuideDocumentSchema.parse(data)

		const existingDocument = await prisma.startupGuideDocument.findUnique({
			where: { id: validatedData.id },
		})

		if (!existingDocument) {
			return {
				ok: false,
				message: "Documento guía no encontrado",
			}
		}

		const guideDocument = await prisma.startupGuideDocument.update({
			where: { id: validatedData.id },
			data: {
				name: validatedData.name,
				description: validatedData.description,
				url: validatedData.url,
				type: validatedData.type,
				size: validatedData.size,
				visibility: validatedData.visibility,
				order: validatedData.order,
			},
		})

  await logActivity({
			userId: session.user.id,
			module: MODULES.STARTUP_FOLDERS,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: guideDocument.id,
			entityType: "StartupGuideDocument",
			metadata: {
				name: guideDocument.name,
				visibility: guideDocument.visibility,
				previousName: existingDocument.name,
			},
		})

		return {
			ok: true,
			message: "Documento guía actualizado correctamente",
			data: guideDocument,
		}
	} catch (error) {
		console.error("Error al actualizar documento guía:", error)
		return {
			ok: false,
			message: "Error al actualizar el documento guía",
		}
	}
}
