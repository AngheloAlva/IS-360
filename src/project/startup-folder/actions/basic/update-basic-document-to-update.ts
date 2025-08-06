"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { ReviewStatus } from "@prisma/client"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export interface UpdateBasicDocumentToUpdateParams {
	documentIds: string[]
	startupFolderId: string
}

export async function updateBasicDocumentToUpdate({
	documentIds,
	startupFolderId,
}: UpdateBasicDocumentToUpdateParams) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})
		if (!session?.user?.id) {
			return { ok: false, message: "No autorizado" }
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

		// Update documents to TO_UPDATE status
		await prisma.basicDocument.updateMany({
			where: {
				id: { in: documentIds },
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

		// Get updated documents for logging and folder status update
		const documents = await prisma.basicDocument.findMany({
			where: {
				id: { in: documentIds },
			},
			select: {
				id: true,
				name: true,
				type: true,
				folderId: true,
				folder: {
					select: {
						startupFolderId: true,
						startupFolder: {
							select: {
								companyId: true,
							},
						},
					},
				},
			},
		})

		if (documents.length === 0) {
			return { ok: false, message: "No se encontraron documentos para actualizar" }
		}

		// Group documents by folder to update folder status
		const folderIds = [...new Set(documents.map((doc) => doc.folderId))]

		for (const folderId of folderIds) {
			const folderDocuments = await prisma.basicDocument.findMany({
				where: {
					folderId,
				},
				select: {
					status: true,
				},
			})

			// Update folder status to DRAFT if no documents are SUBMITTED
			const hasSubmittedDocuments = folderDocuments.some((doc) => doc.status === "SUBMITTED")

			if (!hasSubmittedDocuments) {
				await prisma.basicFolder.update({
					where: {
						id: folderId,
					},
					data: {
						status: ReviewStatus.DRAFT,
					},
				})
			}
		}

		// Log activity for each document
		for (const document of documents) {
			await logActivity({
				userId: session.user.id,
				module: MODULES.STARTUP_FOLDERS,
				action: ACTIVITY_TYPE.UPDATE,
				entityType: "BasicDocument",
				entityId: document.id,
				metadata: {
					documentName: document.name,
					documentType: document.type,
					newStatus: "TO_UPDATE",
					startupFolderId,
					companyId: document.folder.startupFolder.companyId,
				},
			})
		}

		return {
			ok: true,
			message: `${documents.length} documento(s) marcado(s) para actualizar exitosamente`,
		}
	} catch (error) {
		console.error("Error updating basic documents to TO_UPDATE:", error)
		return {
			ok: false,
			message: "Error interno del servidor",
		}
	}
}
