"use server"

import prisma from "@/lib/prisma"

import type { UpdateStartupFolderDocumentSchema } from "@/lib/form-schemas/startup-folder/update-file.schema"
import type { UploadStartupFolderDocumentSchema } from "@/lib/form-schemas/startup-folder/new-file.schema"
import type { WorkerDocumentType } from "@prisma/client"
import type { UploadResult } from "@/lib/upload-files"

export const createWorkerDocument = async ({
	data: { folderId, name, type, expirationDate, workerId, documentId },
	file,
	userId,
}: {
	data: UploadStartupFolderDocumentSchema
	file: UploadResult
	userId: string
}) => {
	try {
		if (!workerId) {
			return { ok: false, message: "ID de trabajador es requerido" }
		}

		const folder = await prisma.startupFolder.findUnique({
			where: {
				id: folderId,
			},
		})

		if (!folder) {
			return { ok: false, message: "Carpeta no encontrada" }
		}

		if (folder.status !== "DRAFT" && folder.status !== "REJECTED") {
			return {
				ok: false,
				message:
					"No puedes modificar documentos en esta carpeta porque está en revisión o ya fue aprobada",
			}
		}

		// Buscar o crear la carpeta del trabajador
		const workerFolder = await prisma.workerFolder.findUnique({
			where: {
				workerId_startupFolderId: {
					workerId,
					startupFolderId: folderId,
				},
			},
		})

		if (!workerFolder) {
			return { ok: false, message: "Carpeta de trabajador no encontrada" }
		}

		// Crear el documento
		const document = await prisma.workerDocument.update({
			where: {
				id: documentId,
			},
			data: {
				expirationDate,
				workerFolder: {
					connect: {
						id: workerFolder.id,
					},
				},
				folder: {
					connect: {
						id: folderId,
					},
				},
				name: name || "",
				url: file.url,
				fileType: file.type,
				category: "PERSONNEL",
				uploadedAt: new Date(),
				type: type as WorkerDocumentType,
				uploadedBy: {
					connect: {
						id: userId,
					},
				},
			},
		})

		return { ok: true, data: document }
	} catch (error) {
		console.error("Error al crear documento:", error)
		return { ok: false, message: "Error al procesar la solicitud" }
	}
}

export const updateWorkerDocument = async ({
	file,
	data: { documentId, expirationDate },
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
				workerFolder: {
					include: {
						worker: true,
					},
				},
			},
		})

		if (!existingDocument) {
			return { ok: false, message: "Documento no encontrado" }
		}

		if (!existingDocument.workerFolder) {
			return { ok: false, message: "Carpeta de trabajador no encontrada" }
		}

		if (
			existingDocument.folder.status !== "DRAFT" &&
			existingDocument.folder.status !== "REJECTED"
		) {
			return {
				ok: false,
				message:
					"No puedes modificar documentos en esta carpeta porque está en revisión o ya fue aprobada",
			}
		}

		// Actualizar el documento
		const updatedDocument = await prisma.workerDocument.update({
			where: {
				id: documentId,
			},
			data: {
				expirationDate,
				url: file.url,
				fileType: file.type,
				uploadedAt: new Date(),
				uploadedBy: {
					connect: {
						id: userId,
					},
				},
			},
			include: {
				workerFolder: {
					include: {
						worker: true,
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
