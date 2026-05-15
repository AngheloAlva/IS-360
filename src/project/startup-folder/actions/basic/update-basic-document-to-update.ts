"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, DocumentCategory, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { ReviewStatus } from "@/generated/prisma/enums"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { recomputeSubfolderStatus } from "../recompute-subfolder-status"

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
						workerId: true,
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

		const workerIds = [
			...new Set(documents.map((document) => document.folder.workerId).filter(Boolean)),
		]

		for (const workerId of workerIds) {
			await recomputeSubfolderStatus({
				startupFolderId,
				workerId,
				category: DocumentCategory.BASIC,
			})
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
