"use server"

import { LABOR_CONTROL_STATUS, WORKER_LABOR_CONTROL_DOCUMENT_TYPE } from "@prisma/client"
import prisma from "@/lib/prisma"

import type { UpdateWorkerDocumentSchema } from "@/project/labor-control/schemas/update-file.schema"
import type { UploadResult } from "@/lib/upload-files"

export const updateWorkerDocument = async ({
	data: { documentId, documentName, documentType },
	uploadedFile,
	userId,
}: {
	data: UpdateWorkerDocumentSchema
	uploadedFile: UploadResult
	userId: string
}) => {
	try {
		const existingDocument = await prisma.workerLaborControlDocument.findUnique({
			where: {
				id: documentId,
			},
			include: {
				folder: {
					select: {
						status: true,
					},
				},
			},
		})

		if (!existingDocument) {
			return { ok: false, message: "Documento no encontrado" }
		}

		if (existingDocument.folder.status === LABOR_CONTROL_STATUS.APPROVED) {
			return {
				ok: false,
				message: "No puedes modificar documentos en esta carpeta porque ya fue aprobada",
			}
		}

		const updatedDocument = await prisma.workerLaborControlDocument.update({
			where: {
				id: documentId,
			},
			data: {
				name: documentName,
				url: uploadedFile.url,
				uploadDate: new Date(),
				status: LABOR_CONTROL_STATUS.DRAFT,
				type: documentType as WORKER_LABOR_CONTROL_DOCUMENT_TYPE,
				uploadBy: {
					connect: {
						id: userId,
					},
				},
			},
		})

		return { ok: true, data: updatedDocument }
	} catch (error) {
		console.error("Error al actualizar documento:", error)
		return { ok: false, message: "Error al procesar la solicitud" }
	}
}
