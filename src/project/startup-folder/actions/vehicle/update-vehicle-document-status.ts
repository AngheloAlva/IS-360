"use server"

import { ACTIVITY_TYPE, DocumentCategory, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import prisma from "@/lib/prisma"

interface UndoDocumentReviewParams {
	userId: string
	documentId: string
}

export async function undoVehicleDocumentReview({ userId, documentId }: UndoDocumentReviewParams) {
	try {
		const document = await prisma.vehicleDocument.update({
			where: {
				id: documentId,
			},
			data: {
				status: "SUBMITTED",
			},
		})

		if (!document) {
			return {
				ok: false,
				message: "Documento no encontrado",
			}
		}

		const folder = await prisma.vehicleFolder.update({
			where: {
				id: document.folderId,
			},
			data: {
				status: "SUBMITTED",
			},
		})

		if (!folder) {
			return {
				ok: false,
				message: "Carpeta no encontrada",
			}
		}

		logActivity({
			userId,
			module: MODULES.STARTUP_FOLDERS,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: document.id,
			entityType: "VehicleDocument",
			metadata: {
				documentId: document.id,
				startupFolderId: document.folderId,
				category: DocumentCategory.VEHICLES,
			},
		})

		return {
			ok: true,
			message: "Documento actualizado correctamente",
		}
	} catch (error) {
		console.error("Error updating document status:", error)
		if (error instanceof Error && error.message.includes("Unique constraint")) {
			return {
				ok: false,
				message: "No se pudo actualizar el estado del documento",
			}
		}
		return {
			ok: true,
			message: "Documento actualizado correctamente",
		}
	}
}
