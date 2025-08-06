"use server"

import { ACTIVITY_TYPE, DocumentCategory, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import prisma from "@/lib/prisma"

interface UndoDocumentReviewParams {
	userId: string
	documentIds: string[]
}

export async function undoWorkerDocumentReview({ userId, documentIds }: UndoDocumentReviewParams) {
	try {
		const documents = await prisma.workerDocument.updateMany({
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

		const updatedDocuments = await prisma.workerDocument.findMany({
			where: {
				id: { in: documentIds },
			},
			select: {
				id: true,
				folderId: true,
			},
		})

		const folderIds = [...new Set(updatedDocuments.map((doc) => doc.folderId))]
		await prisma.workerFolder.updateMany({
			where: {
				id: { in: folderIds },
			},
			data: {
				status: "SUBMITTED",
			},
		})

		for (const document of updatedDocuments) {
			logActivity({
				userId,
				module: MODULES.STARTUP_FOLDERS,
				action: ACTIVITY_TYPE.UPDATE,
				entityId: document.id,
				entityType: "WorkerDocument",
				metadata: {
					documentId: document.id,
					startupFolderId: document.folderId,
					category: DocumentCategory.PERSONNEL,
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
