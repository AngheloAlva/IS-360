"use server"

import { z } from "zod"

import { DocumentCategory, ReviewStatus, SafetyAndHealthDocumentType } from "@prisma/client"
import { sendRequestReviewEmail } from "../send-request-review-email"
import prisma from "@/lib/prisma"

import type { UpdateStartupFolderDocumentSchema } from "@/features/startup-folder/schemas/update-file.schema"
import type { UploadStartupFolderDocumentSchema } from "@/features/startup-folder/schemas/new-file.schema"
import type { UpdateExpirationDateSchema } from "@/features/startup-folder/schemas/update-expiration-date"
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

export const updateExpirationDateSafetyAndHealthDocument = async ({
	data: { documentId, expirationDate },
}: {
	data: UpdateExpirationDateSchema
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
	userId,
	folderId,
}: {
	userId: string
	emails: string[]
	folderId: string
}) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			rut: true,
			name: true,
			email: true,
			phone: true,
		},
	})

	if (!user) {
		return { ok: false, message: "Usuario no encontrado." }
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
					additionalNotificationEmails: [...emails, user.email],
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
			solicitator: {
				email: user.email,
				name: user.name,
				rut: user.rut,
				phone: user.phone,
			},
			companyName: folder.startupFolder.company.name,
			folderName: "Carpeta de Seguridad y Salud Ocupacional",
			documentCategory: DocumentCategory.SAFETY_AND_HEALTH,
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
