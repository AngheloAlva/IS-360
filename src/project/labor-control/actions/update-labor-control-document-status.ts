"use server"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import prisma from "@/lib/prisma"

interface UpdateDocumentStatusParams {
	userId: string
	documentIds: string[]
}

export async function updateLaborControlDocumentStatus({
	userId,
	documentIds,
}: UpdateDocumentStatusParams) {
	try {
		const documents = await prisma.laborControlDocument.updateMany({
			where: {
				id: { in: documentIds },
			},
			data: {
				status: "SUBMITTED",
			},
		})

		if (documents.count === 0) {
			return {
				ok: false,
				message: "No se encontraron documentos",
			}
		}

		// Get the updated documents to access their folder IDs
		const updatedDocuments = await prisma.laborControlDocument.findMany({
			where: {
				id: { in: documentIds },
			},
			select: {
				id: true,
				folderId: true,
			},
		})

		// Update folders status
		const folderIds = [...new Set(updatedDocuments.map((doc) => doc.folderId))]
		await prisma.laborControlFolder.updateMany({
			where: {
				id: { in: folderIds },
			},
			data: {
				status: "SUBMITTED",
			},
		})

		// Log activity for each document
		for (const document of updatedDocuments) {
			logActivity({
				userId,
				entityId: document.id,
				action: ACTIVITY_TYPE.UPDATE,
				entityType: "LaborControlDocument",
				module: MODULES.LABOR_CONTROL_FOLDERS,
				metadata: {
					documentId: document.id,
					folderId: document.folderId,
				},
			})
		}

		return {
			ok: true,
			message: `${documents.count} documento(s) actualizado(s) correctamente`,
		}
	} catch (error) {
		console.error("Error updating document status:", error)
		if (error instanceof Error && error.message.includes("Unique constraint")) {
			return {
				ok: false,
				message: "No se pudo actualizar el estado de los documentos",
			}
		}
		return {
			ok: false,
			message: "Error al actualizar los documentos",
		}
	}
}
