"use server"

import { DocumentCategory, ReviewStatus } from "@prisma/client"
import prisma from "@/lib/prisma"

interface AddDocumentReviewProps {
	comments: string
	documentId: string
	reviewerId: string
	category: DocumentCategory
	status: "APPROVED" | "REJECTED"
}

export const addDocumentReview = async ({
	status,
	category,
	comments,
	documentId,
}: AddDocumentReviewProps): Promise<{ ok: boolean; message: string }> => {
	try {
		const newStatus = status === "APPROVED" ? ReviewStatus.APPROVED : ReviewStatus.REJECTED

		let document
		const now = new Date()

		switch (category) {
			case DocumentCategory.SAFETY_AND_HEALTH:
				document = await prisma.safetyAndHealthDocument.update({
					where: { id: documentId },
					data: {
						status: newStatus,
						reviewNotes: comments,
						reviewedAt: now,
					},
					include: {
						uploadedBy: true,
					},
				})
				break
			case DocumentCategory.ENVIRONMENTAL:
				document = await prisma.environmentalDocument.update({
					where: { id: documentId },
					data: {
						status: newStatus,
						reviewNotes: comments,
						reviewedAt: now,
					},
					include: {
						uploadedBy: true,
					},
				})
				break
			case DocumentCategory.PERSONNEL:
				document = await prisma.workerDocument.update({
					where: { id: documentId },
					data: {
						reviewNotes: comments,
						reviewedAt: now,
						status: newStatus,
					},
					include: {
						uploadedBy: true,
					},
				})
				break
			case DocumentCategory.VEHICLES:
				document = await prisma.vehicleDocument.update({
					where: { id: documentId },
					data: {
						reviewNotes: comments,
						reviewedAt: now,
						status: newStatus,
					},
					include: {
						uploadedBy: true,
					},
				})
				break
			default:
				throw new Error(`Categoría de documento no soportada: ${category}`)
		}

		// Notificar al supervisor del resultado de la revisión
		if (document?.uploadedBy?.email) {
			// TODO: Implementar envío de notificación por email
			console.log(
				`Notificar a ${document.uploadedBy.email} que su documento fue ${status === "APPROVED" ? "aprobado" : "rechazado"}`
			)
		}

		return {
			ok: true,
			message: "Revisión procesada exitosamente",
		}
	} catch (error) {
		console.error("Error al procesar revisión de documento:", error)

		if (error instanceof Error) {
			return {
				ok: false,
				message: `Error al procesar la revisión: ${error.message}`,
			}
		}

		return {
			ok: false,
			message: "Ocurrió un error inesperado al procesar la revisión",
		}
	}
}
