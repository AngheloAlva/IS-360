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

		switch (category) {
			case DocumentCategory.SAFETY_AND_HEALTH:
				await prisma.safetyAndHealthDocument.update({
					where: { id: documentId },
					data: {
						status: newStatus,
						reviewNotes: comments,
						submittedAt: new Date(),
					},
				})
				break
			case DocumentCategory.ENVIRONMENTAL:
				await prisma.environmentalDocument.update({
					where: { id: documentId },
					data: {
						status: newStatus,
						reviewNotes: comments,
						submittedAt: new Date(),
					},
				})
				break
			case DocumentCategory.PERSONNEL:
				await prisma.workerDocument.update({
					where: { id: documentId },
					data: {
						reviewNotes: comments,
						submittedAt: new Date(),
						status: newStatus,
					},
				})
				break
			case DocumentCategory.VEHICLES:
				await prisma.vehicleDocument.update({
					where: { id: documentId },
					data: {
						reviewNotes: comments,
						submittedAt: new Date(),
						status: newStatus,
					},
				})
				break
		}

		return {
			ok: true,
			message: "Revisión procesada exitosamente",
		}
	} catch (error) {
		console.log(error)
		return {
			ok: false,
			message: "Ocurrió un error al procesar la revisión",
		}
	}
}
