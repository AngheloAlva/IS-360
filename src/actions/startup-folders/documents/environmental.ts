"use server"

import prisma from "@/lib/prisma"

import type { UpdateStartupFolderDocumentSchema } from "@/lib/form-schemas/startup-folder/update-file.schema"
import type { UploadStartupFolderDocumentSchema } from "@/lib/form-schemas/startup-folder/new-file.schema"
import type { EnvironmentalDocType } from "@prisma/client"
import type { UploadResult } from "@/lib/upload-files"

export const createEnvironmentalDocument = async ({
	data: { name, folderId, subcategory },
	documentType,
	uploadedFile,
}: {
	data: UploadStartupFolderDocumentSchema
	documentType: EnvironmentalDocType
	uploadedFile: UploadResult
}) => {
	try {
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
		const document = await prisma.environmentalDocument.create({
			data: {
				name: name || "",
				type: documentType,
				url: uploadedFile.url,
				uploadedAt: new Date(),
				subcategory: subcategory,
				fileType: uploadedFile.type,
				folder: {
					connect: {
						id: folderId,
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

// PUT: Actualizar un documento existente
export const updateEnvironmentalDocument = async ({
	data: { documentId },
	uploadedFile,
}: {
	data: UpdateStartupFolderDocumentSchema
	uploadedFile: UploadResult
}) => {
	try {
		const existingDocument = await prisma.environmentalDocument.findUnique({
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
		const updatedDocument = await prisma.environmentalDocument.update({
			where: {
				id: documentId,
			},
			data: {
				url: uploadedFile.url,
				uploadedAt: new Date(),
			},
		})

		return { ok: true, data: updatedDocument }
	} catch (error) {
		console.error("Error al actualizar documento:", error)
		return { ok: false, message: "Error al procesar la solicitud" }
	}
}
