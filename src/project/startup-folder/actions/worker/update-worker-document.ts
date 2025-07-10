"use server"

import { ReviewStatus, WorkerDocumentType } from "@prisma/client"
import prisma from "@/lib/prisma"

import type { UpdateStartupFolderDocumentSchema } from "@/project/startup-folder/schemas/update-file.schema"
import type { UploadResult } from "@/lib/upload-files"

export const updateWorkerDocument = async ({
	file,
	data: { documentId, expirationDate, documentName, documentType },
	userId,
}: {
	file: UploadResult
	data: UpdateStartupFolderDocumentSchema
	userId: string
}) => {
	try {
		const existingDocument = await prisma.workerDocument.findUnique({
			where: {
				id: documentId,
			},
			include: {
				folder: true,
			},
		})

		if (!existingDocument) {
			return { ok: false, message: "Documento no encontrado" }
		}

		if (!existingDocument.folder) {
			return { ok: false, message: "Carpeta de trabajador no encontrada" }
		}

		if (existingDocument.folder.status === ReviewStatus.APPROVED) {
			return {
				ok: false,
				message: "No puedes modificar documentos en esta carpeta porque ya fue aprobada",
			}
		}

		// Actualizar el documento
		const updatedDocument = await prisma.workerDocument.update({
			where: {
				id: documentId,
			},
			data: {
				url: file.url,
				expirationDate,
				name: documentName,
				type: documentType as WorkerDocumentType,
				uploadedAt: new Date(),
				status: "DRAFT",
				uploadedBy: {
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
