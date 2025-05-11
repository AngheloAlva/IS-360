"use server"

import prisma from "@/lib/prisma"

import type { UpdateStartupFolderDocumentSchema } from "@/lib/form-schemas/startup-folder/update-file.schema"
import type { UploadStartupFolderDocumentSchema } from "@/lib/form-schemas/startup-folder/new-file.schema"
import type { WorkerDocumentType } from "@prisma/client"
import type { UploadResult } from "@/lib/upload-files"

export const createWorkerDocument = async ({
	data: { folderId, name, subcategory },
	documentType,
	file,
}: {
	data: UploadStartupFolderDocumentSchema
	documentType: WorkerDocumentType
	file: UploadResult
}) => {
	try {
		// Verificar que la carpeta exista y que el usuario tenga permisos
		const folder = await prisma.workOrderStartupFolder.findUnique({
			where: {
				id: folderId,
			},
			include: {
				workOrder: {
					include: {
						company: true,
					},
				},
			},
		})

		if (!folder) {
			return { ok: false, message: "Carpeta no encontrada" }
		}

		// Verificar que la carpeta esté en estado DRAFT o REJECTED para poder modificar documentos
		if (folder.status !== "DRAFT" && folder.status !== "REJECTED") {
			return {
				ok: false,
				message:
					"No puedes modificar documentos en esta carpeta porque está en revisión o ya fue aprobada",
			}
		}

		// Crear el documento
		const document = await prisma.workerDocument.create({
			data: {
				folder: {
					connect: {
						id: folderId,
					},
				},
				workerId: "",
				name: name || "",
				url: file.url,
				type: documentType,
				fileType: file.type,
				uploadedAt: new Date(),
				subcategory: subcategory,
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
	data: { documentId },
}: {
	file: UploadResult
	data: UpdateStartupFolderDocumentSchema
}) => {
	try {
		const existingDocument = await prisma.workerDocument.findUnique({
			where: {
				id: documentId,
			},
			include: {
				folder: {
					include: {
						workOrder: {
							include: {
								company: true,
							},
						},
					},
				},
			},
		})

		if (!existingDocument) {
			return { ok: false, message: "Documento no encontrado" }
		}

		// Verificar que la carpeta esté en estado DRAFT o REJECTED para poder modificar documentos
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
				url: file.url,
				uploadedAt: new Date(),
			},
		})

		return { ok: true, data: updatedDocument }
	} catch (error) {
		console.error("Error al actualizar documento:", error)
		return { ok: false, message: "Error al procesar la solicitud" }
	}
}
