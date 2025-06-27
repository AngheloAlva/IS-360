"use server"

import { z } from "zod"

import { ACTIVITY_TYPE, DocumentCategory, MODULES, type WorkerDocumentType } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import prisma from "@/lib/prisma"

const createWorkerDocumentSchema = z.object({
	url: z.string(),
	userId: z.string(),
	workerId: z.string(),
	documentType: z.string(),
	documentName: z.string(),
	expirationDate: z.date(),
	startupFolderId: z.string(),
})

export type CreateWorkerDocumentInput = z.infer<typeof createWorkerDocumentSchema>

export async function createWorkerDocument(input: CreateWorkerDocumentInput) {
	try {
		const { userId, workerId, documentType, documentName, url, expirationDate, startupFolderId } =
			createWorkerDocumentSchema.parse(input)

		const workerFolder = await prisma.workerFolder.findUnique({
			where: { workerId_startupFolderId: { workerId, startupFolderId } },
			select: {
				id: true,
				worker: {
					select: {
						id: true,
						companyId: true,
					},
				},
			},
		})

		if (!workerFolder) {
			return {
				ok: false,
				message: "Carpeta de personal no encontrada",
			}
		}

		const user = await prisma.user.findUnique({ where: { id: userId } })

		if (!user || user.companyId !== workerFolder.worker.companyId) {
			return {
				ok: false,
				message: "No autorizado - El usuario no pertenece a la empresa",
			}
		}

		const document = await prisma.workerDocument.create({
			data: {
				url,
				expirationDate,
				name: documentName,
				category: DocumentCategory.PERSONNEL,
				uploadedById: userId,
				folderId: workerFolder.id,
				type: documentType as WorkerDocumentType,
			},
		})

		if (!document) {
			return {
				ok: false,
				message: "Error al crear el documento",
			}
		}

		logActivity({
			userId,
			module: MODULES.STARTUP_FOLDERS,
			action: ACTIVITY_TYPE.UPLOAD,
			entityId: document.id,
			entityType: "WorkerDocument",
			metadata: {
				documentName,
				documentType,
				workerId,
				startupFolderId,
				documentUrl: url,
				expirationDate: expirationDate.toISOString(),
			},
		})

		return {
			ok: true,
			message: "Documento de personal subido correctamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Ocurrio un error subiendo el documento",
		}
	}
}
