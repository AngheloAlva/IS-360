"use server"

import { z } from "zod"

import { ACTIVITY_TYPE, MODULES, WORKER_LABOR_CONTROL_DOCUMENT_TYPE } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import prisma from "@/lib/prisma"

const createWorkerDocumentSchema = z.object({
	url: z.string(),
	userId: z.string(),
	workerId: z.string(),
	folderId: z.string(),
	documentType: z.string(),
	documentName: z.string(),
})

export type CreateWorkerDocumentInput = z.infer<typeof createWorkerDocumentSchema>

export async function createWorkerDocument(
	input: CreateWorkerDocumentInput
): Promise<{ ok: boolean; message?: string }> {
	try {
		const { userId, workerId, documentType, documentName, url, folderId } =
			createWorkerDocumentSchema.parse(input)

		const workerFolder = await prisma.workerLaborControlFolder.findUnique({
			where: { id: folderId },
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

		if (!user || user.companyId !== workerFolder.worker?.companyId) {
			return {
				ok: false,
				message: "No autorizado - El usuario no pertenece a la empresa",
			}
		}

		const document = await prisma.workerLaborControlDocument.create({
			data: {
				url,
				name: documentName,
				uploadById: userId,
				folderId: workerFolder.id,
				type: documentType as WORKER_LABOR_CONTROL_DOCUMENT_TYPE,
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
			entityType: "BasicDocument",
			metadata: {
				folderId,
				workerId,
				documentType,
				documentName,
				documentUrl: url,
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
