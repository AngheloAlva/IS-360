"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES, ReviewStatus } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export interface UpdateSafetyDocumentToUpdateParams {
	documentIds: string[]
	startupFolderId: string
}

export async function updateSafetyDocumentToUpdate({
	documentIds,
	startupFolderId,
}: UpdateSafetyDocumentToUpdateParams) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	// Verify user has permission to update documents
	const startupFolder = await prisma.startupFolder.findUnique({
		where: { id: startupFolderId },
		select: {
			companyId: true,
		},
	})

	if (!startupFolder) {
		return { ok: false, message: "Carpeta de arranque no encontrada" }
	}

	try {
		// Actualizar múltiples documentos
		const updatedDocuments = await prisma.safetyAndHealthDocument.updateMany({
			where: {
				id: {
					in: documentIds,
				},
				folder: {
					startupFolderId,
				},
			},
			data: {
				status: ReviewStatus.TO_UPDATE,
				reviewedAt: new Date(),
				reviewerId: session.user.id,
			},
		})

		if (updatedDocuments.count === 0) {
			return {
				ok: false,
				message: "No se encontraron documentos para actualizar",
			}
		}

		// Obtener información de los documentos para logging
		const documents = await prisma.safetyAndHealthDocument.findMany({
			where: {
				id: {
					in: documentIds,
				},
			},
			select: {
				id: true,
				name: true,
				type: true,
				folderId: true,
			},
		})

		if (documents.length === 0) {
			return { ok: false, message: "No se encontraron documentos para actualizar" }
		}

		// Verificar si hay documentos SUBMITTED en la carpeta
		const folderDocuments = await prisma.safetyAndHealthDocument.findMany({
			where: {
				folder: {
					startupFolderId,
				},
			},
			select: {
				status: true,
			},
		})

		// Actualizar estado de la carpeta a DRAFT si no hay documentos SUBMITTED
		const hasSubmittedDocuments = folderDocuments.some((doc) => doc.status === "SUBMITTED")

		if (!hasSubmittedDocuments) {
			await prisma.safetyAndHealthFolder.update({
				where: {
					startupFolderId,
				},
				data: {
					status: ReviewStatus.DRAFT,
				},
			})
		}

		// Registrar actividad para cada documento
		for (const document of documents) {
			await logActivity({
				userId: session.user.id,
				module: MODULES.STARTUP_FOLDERS,
				action: ACTIVITY_TYPE.UPDATE,
				entityType: "SafetyAndHealthDocument",
				entityId: document.id,
				metadata: {
					documentName: document.name,
					documentType: document.type,
					newStatus: "TO_UPDATE",
					startupFolderId,
					companyId: startupFolder.companyId,
				},
			})
		}

		return {
			ok: true,
			message: `${documents.length} documento(s) marcado(s) para actualizar exitosamente`,
		}
	} catch (error) {
		console.error("Error updating safety documents to update status:", error)
		return {
			ok: false,
			message: "Error interno del servidor",
		}
	}
}
