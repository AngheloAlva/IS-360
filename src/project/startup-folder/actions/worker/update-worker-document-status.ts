"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, DocumentCategory, MODULES, ReviewStatus } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import { recomputeSubfolderStatus } from "../recompute-subfolder-status"

interface UndoDocumentReviewParams {
	documentIds: string[]
}

export async function undoWorkerDocumentReview({ documentIds }: UndoDocumentReviewParams) {
	try {
		const session = await auth.api.getSession({ headers: await headers() })

		if (!session?.user?.id) {
			return { ok: false, message: "No autorizado" }
		}

		const documents = await prisma.workerDocument.updateMany({
			where: { id: { in: documentIds } },
			data: {
				status: ReviewStatus.SUBMITTED,
				reviewedAt: null,
				reviewerId: null,
				reviewNotes: null,
			},
		})

		if (documents.count === 0) {
			return { ok: false, message: "No se encontraron documentos" }
		}

		const updatedDocuments = await prisma.workerDocument.findMany({
			where: { id: { in: documentIds } },
			select: {
				id: true,
				folder: {
					select: {
						workerId: true,
						startupFolderId: true,
					},
				},
			},
		})

		const uniqueTargets = new Set(
			updatedDocuments
				.map((document) => `${document.folder.workerId}:${document.folder.startupFolderId}`)
				.filter(Boolean)
		)

		for (const target of uniqueTargets) {
			const [workerId, startupFolderId] = target.split(":")
			await recomputeSubfolderStatus({
				category: DocumentCategory.PERSONNEL,
				workerId,
				startupFolderId,
			})
		}

		for (const document of updatedDocuments) {
   await logActivity({
				userId: session.user.id,
				module: MODULES.STARTUP_FOLDERS,
				action: ACTIVITY_TYPE.UPDATE,
				entityId: document.id,
				entityType: "WorkerDocument",
				metadata: {
					documentId: document.id,
					startupFolderId: document.folder.startupFolderId,
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
		return { ok: false, message: "Error al actualizar los documentos" }
	}
}
