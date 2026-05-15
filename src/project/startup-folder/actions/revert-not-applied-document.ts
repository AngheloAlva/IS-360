"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, DocumentCategory, MODULES, ReviewStatus } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import { recomputeSubfolderStatus } from "./recompute-subfolder-status"

interface RevertNotAppliedDocumentInput {
	documentId: string
	category: DocumentCategory
}

export async function revertNotAppliedDocument({
	documentId,
	category,
}: RevertNotAppliedDocumentInput): Promise<{ ok: boolean; message: string }> {
	const session = await auth.api.getSession({ headers: await headers() })

	if (!session?.user?.id) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		if (category === DocumentCategory.SAFETY_AND_HEALTH) {
			const document = await prisma.safetyAndHealthDocument.findUnique({
				where: { id: documentId },
				select: { id: true, status: true, folder: { select: { startupFolderId: true } } },
			})
			if (!document || document.status !== ReviewStatus.NOT_APPLIED) {
				return { ok: false, message: "Documento no encontrado o no esta en No Aplica" }
			}
			await prisma.safetyAndHealthDocument.delete({ where: { id: documentId } })
			await recomputeSubfolderStatus({
				category,
				startupFolderId: document.folder.startupFolderId,
			})
		}

		if (category === DocumentCategory.ENVIRONMENTAL) {
			const document = await prisma.environmentalDocument.findUnique({
				where: { id: documentId },
				select: { id: true, status: true, folder: { select: { startupFolderId: true } } },
			})
			if (!document || document.status !== ReviewStatus.NOT_APPLIED) {
				return { ok: false, message: "Documento no encontrado o no esta en No Aplica" }
			}
			await prisma.environmentalDocument.delete({ where: { id: documentId } })
			await recomputeSubfolderStatus({
				category,
				startupFolderId: document.folder.startupFolderId,
			})
		}

		if (category === DocumentCategory.ENVIRONMENT) {
			const document = await prisma.environmentDocument.findUnique({
				where: { id: documentId },
				select: { id: true, status: true, folder: { select: { startupFolderId: true } } },
			})
			if (!document || document.status !== ReviewStatus.NOT_APPLIED) {
				return { ok: false, message: "Documento no encontrado o no esta en No Aplica" }
			}
			await prisma.environmentDocument.delete({ where: { id: documentId } })
			await recomputeSubfolderStatus({
				category,
				startupFolderId: document.folder.startupFolderId,
			})
		}

		if (category === DocumentCategory.TECHNICAL_SPECS) {
			const document = await prisma.techSpecsDocument.findUnique({
				where: { id: documentId },
				select: { id: true, status: true, folder: { select: { startupFolderId: true } } },
			})
			if (!document || document.status !== ReviewStatus.NOT_APPLIED) {
				return { ok: false, message: "Documento no encontrado o no esta en No Aplica" }
			}
			await prisma.techSpecsDocument.delete({ where: { id: documentId } })
			await recomputeSubfolderStatus({
				category,
				startupFolderId: document.folder.startupFolderId,
			})
		}

		if (category === DocumentCategory.PERSONNEL) {
			const document = await prisma.workerDocument.findUnique({
				where: { id: documentId },
				select: {
					id: true,
					status: true,
					folder: { select: { startupFolderId: true, workerId: true } },
				},
			})
			if (!document || document.status !== ReviewStatus.NOT_APPLIED) {
				return { ok: false, message: "Documento no encontrado o no esta en No Aplica" }
			}
			await prisma.workerDocument.delete({ where: { id: documentId } })
			await recomputeSubfolderStatus({
				category,
				workerId: document.folder.workerId,
				startupFolderId: document.folder.startupFolderId,
			})
		}

		if (category === DocumentCategory.VEHICLES) {
			const document = await prisma.vehicleDocument.findUnique({
				where: { id: documentId },
				select: {
					id: true,
					status: true,
					folder: { select: { startupFolderId: true, vehicleId: true } },
				},
			})
			if (!document || document.status !== ReviewStatus.NOT_APPLIED) {
				return { ok: false, message: "Documento no encontrado o no esta en No Aplica" }
			}
			await prisma.vehicleDocument.delete({ where: { id: documentId } })
			await recomputeSubfolderStatus({
				category,
				vehicleId: document.folder.vehicleId,
				startupFolderId: document.folder.startupFolderId,
			})
		}

		if (category === DocumentCategory.BASIC) {
			const document = await prisma.basicDocument.findUnique({
				where: { id: documentId },
				select: {
					id: true,
					status: true,
					folder: { select: { startupFolderId: true, workerId: true } },
				},
			})
			if (!document || document.status !== ReviewStatus.NOT_APPLIED) {
				return { ok: false, message: "Documento no encontrado o no esta en No Aplica" }
			}
			await prisma.basicDocument.delete({ where: { id: documentId } })
			await recomputeSubfolderStatus({
				category,
				workerId: document.folder.workerId,
				startupFolderId: document.folder.startupFolderId,
			})
		}

  await logActivity({
			userId: session.user.id,
			module: MODULES.STARTUP_FOLDERS,
			action: ACTIVITY_TYPE.DELETE,
			entityId: documentId,
			entityType: "StartupFolderDocument",
			metadata: {
				category,
				status: "NOT_APPLIED",
				action: "revert",
			},
		})

		return { ok: true, message: "No Aplica revertido correctamente" }
	} catch (error) {
		console.error("Error al revertir documento No Aplica:", error)
		return { ok: false, message: "Error al revertir No Aplica" }
	}
}
