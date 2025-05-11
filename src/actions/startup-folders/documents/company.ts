"use server"

import prisma from "@/lib/prisma"

import type { UpdateStartupFolderDocumentSchema } from "@/lib/form-schemas/startup-folder/update-file.schema"
import type { UploadStartupFolderDocumentSchema } from "@/lib/form-schemas/startup-folder/new-file.schema"
import type { CompanyDocumentType } from "@prisma/client"
import type { UploadResult } from "@/lib/upload-files"

export const createCompanyDocument = async ({
	data: { name, folderId, subcategory },
	documentType,
	uploadedFile,
}: {
	data: UploadStartupFolderDocumentSchema
	documentType: CompanyDocumentType
	uploadedFile: UploadResult
}) => {
	try {
		const folder = await prisma.generalStartupFolder.findUnique({
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
		const document = await prisma.companyDocument.create({
			data: {
				folder: {
					connect: {
						id: folderId,
					},
				},
				fileType: "FILE",
				name: name || "",
				type: documentType,
				url: uploadedFile.url,
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

export const updateCompanyDocument = async ({
	data: { documentId },
	uploadedFile,
}: {
	data: UpdateStartupFolderDocumentSchema
	uploadedFile: UploadResult
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
