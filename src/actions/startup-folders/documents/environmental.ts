"use server"

import prisma from "@/lib/prisma"

import type { UpdateStartupFolderDocumentSchema } from "@/lib/form-schemas/startup-folder/update-file.schema"
import type { UploadStartupFolderDocumentSchema } from "@/lib/form-schemas/startup-folder/new-file.schema"
import { ReviewStatus, type EnvironmentalDocType } from "@prisma/client"
import type { UploadResult } from "@/lib/upload-files"
import { z } from "zod"

export const createEnvironmentalDocument = async ({
	data: { name, folderId, type, expirationDate, documentId },
	uploadedFile,
	userId,
}: {
	data: UploadStartupFolderDocumentSchema
	uploadedFile: UploadResult
	userId: string
}) => {
	try {
		const folder = await prisma.environmentalFolder.findUnique({
			where: {
				id: folderId,
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
		const document = await prisma.environmentalDocument.update({
			where: {
				id: documentId,
			},
			data: {
				expirationDate,
				name: name || "",
				url: uploadedFile.url,
				uploadedAt: new Date(),
				category: "ENVIRONMENTAL",
				type: type as EnvironmentalDocType,
				uploadedBy: {
					connect: {
						id: userId,
					},
				},
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
	data: { documentId, expirationDate },
	uploadedFile,
	userId,
}: {
	data: UpdateStartupFolderDocumentSchema
	uploadedFile: UploadResult
	userId: string
}) => {
	try {
		const existingDocument = await prisma.environmentalDocument.findUnique({
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

export const submitEnvironmentalDocumentForReview = async ({
	emails,
	folderId,
}: {
	emails: string[]
	folderId: string
}) => {
	if (!emails || emails.length === 0) {
		return {
			ok: false,
			message: "Por favor, ingresa al menos un correo electrónico.",
		}
	}

	try {
		const folder = await prisma.environmentalFolder.findUnique({
			where: { id: folderId },
		})

		if (!folder) {
			return { ok: false, message: "Carpeta no encontrada." }
		}

		if (folder.status !== ReviewStatus.DRAFT && folder.status !== ReviewStatus.REJECTED) {
			return {
				ok: false,
				message: `La carpeta no se puede enviar a revisión porque su estado actual es '${folder.status}'. Solo carpetas en Borrador o Rechazada pueden ser enviadas.`,
			}
		}

		await Promise.all([
			prisma.environmentalFolder.update({
				where: { id: folderId },
				data: {
					submittedAt: new Date(),
					status: ReviewStatus.SUBMITTED,
					additionalNotificationEmails: emails,
				},
			}),
			prisma.environmentalDocument.updateMany({
				where: {
					folderId,
				},
				data: {
					submittedAt: new Date(),
					status: ReviewStatus.SUBMITTED,
				},
			}),
		])

		// TODO: Send emails to OTC members

		return {
			ok: true,
			message: "La carpeta ha sido enviada a revisión correctamente.",
		}
	} catch (error) {
		console.error("Error al enviar la carpeta a revisión:", error)
		if (error instanceof z.ZodError) {
			return {
				ok: false,
				message: "Error de validación: " + error.errors.map((e) => e.message).join(", "),
			}
		}
		return { ok: false, message: "Ocurrió un error en el servidor." }
	}
}
