"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import { guideDocumentSchema, type GuideDocumentInput } from "../../schemas/guide-document.schema"

export const createGuideDocument = async (data: GuideDocumentInput) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	// Solo admins pueden crear documentos guía
	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permission: {
				startupFolder: ["create"],
			},
		},
	})

	if (!hasPermission.success) {
		return {
			ok: false,
			message: "No tienes permiso para crear documentos guía",
		}
	}

	try {
		const validatedData = guideDocumentSchema.parse(data)

		const guideDocument = await prisma.startupGuideDocument.create({
			data: {
				name: validatedData.name,
				description: validatedData.description,
				url: validatedData.url,
				type: validatedData.type,
				size: validatedData.size,
				visibility: validatedData.visibility,
				order: validatedData.order ?? 0,
				createdById: session.user.id,
			},
		})

  await logActivity({
			userId: session.user.id,
			module: MODULES.STARTUP_FOLDERS,
			action: ACTIVITY_TYPE.CREATE,
			entityId: guideDocument.id,
			entityType: "StartupGuideDocument",
			metadata: {
				name: guideDocument.name,
				visibility: guideDocument.visibility,
			},
		})

		return {
			ok: true,
			message: "Documento guía creado correctamente",
			data: guideDocument,
		}
	} catch (error) {
		console.error("Error al crear documento guía:", error)
		return {
			ok: false,
			message: "Error al crear el documento guía",
		}
	}
}
