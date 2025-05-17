"use server"

import { CompanyDocumentType } from "@prisma/client"
import prisma from "@/lib/prisma"

import type { UpdateStartupFolderDocumentSchema } from "@/lib/form-schemas/startup-folder/update-file.schema"
import type { UploadStartupFolderDocumentSchema } from "@/lib/form-schemas/startup-folder/new-file.schema"
import type { UploadResult } from "@/lib/upload-files"

export const createSafetyAndHealthDocument = async ({
	data: { name, folderId, type, expirationDate, documentId },
	uploadedFile,
	userId,
}: {
	data: UploadStartupFolderDocumentSchema
	uploadedFile: UploadResult
	userId: string
}) => {
	try {
		const folder = await prisma.startupFolder.findUnique({
			where: {
				id: folderId,
			},
			include: {
				company: true,
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

		const document = await prisma.companyDocument.update({
			where: {
				id: documentId,
			},
			data: {
				expirationDate,
				folder: {
					connect: {
						id: folderId,
					},
				},
				fileType: "FILE",
				name: name || "",
				url: uploadedFile.url,
				uploadedAt: new Date(),
				category: "SAFETY_AND_HEALTH",
				type: type as CompanyDocumentType,
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

export const updateSafetyAndHealthDocument = async ({
	data: { documentId, expirationDate },
	uploadedFile,
	userId,
}: {
	data: UpdateStartupFolderDocumentSchema
	uploadedFile: UploadResult
	userId: string
}) => {
	try {
		const existingDocument = await prisma.companyDocument.findUnique({
			where: {
				id: documentId,
			},
			include: {
				folder: {
					include: {
						company: true,
					},
				},
			},
		})

		if (!existingDocument) {
			return { ok: false, message: "Documento no encontrado" }
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

		const updatedDocument = await prisma.companyDocument.update({
			where: {
				id: documentId,
			},
			data: {
				expirationDate,
				url: uploadedFile.url,
				uploadedAt: new Date(),
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
