"use server"

import { ReviewStatus, SafetyAndHealthDocumentType } from "@prisma/client"
import prisma from "@/lib/prisma"

import type { UpdateStartupFolderDocumentSchema } from "@/lib/form-schemas/startup-folder/update-file.schema"
import type { UploadStartupFolderDocumentSchema } from "@/lib/form-schemas/startup-folder/new-file.schema"
import type { UploadResult } from "@/lib/upload-files"
import { z } from "zod"
import { sendRequestReviewEmail } from "../send-request-review-email"

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
		const folder = await prisma.safetyAndHealthFolder.findUnique({
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

		const document = await prisma.safetyAndHealthDocument.update({
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
				name: name || "",
				url: uploadedFile.url,
				uploadedAt: new Date(),
				category: "SAFETY_AND_HEALTH",
				type: type as SafetyAndHealthDocumentType,
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
		const existingDocument = await prisma.safetyAndHealthDocument.findUnique({
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

		const updatedDocument = await prisma.safetyAndHealthDocument.update({
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

export const submitSafetyAndHealthDocumentForReview = async ({
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
		const folder = await prisma.safetyAndHealthFolder.findUnique({
			where: { id: folderId },
			select: {
				startupFolder: {
					select: {
						company: {
							select: {
								name: true,
							},
						},
					},
				},
				status: true,
			},
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
			prisma.safetyAndHealthFolder.update({
				where: { id: folderId },
				data: {
					submittedAt: new Date(),
					status: ReviewStatus.SUBMITTED,
					additionalNotificationEmails: emails,
				},
			}),
			prisma.safetyAndHealthDocument.updateMany({
				where: {
					folderId,
				},
				data: {
					submittedAt: new Date(),
					status: ReviewStatus.SUBMITTED,
				},
			}),
		])

		await sendRequestReviewEmail({
			companyName: folder.startupFolder.company.name,
			folderName: "Carpeta de Seguridad y Salud Ocupacional",
		})

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
