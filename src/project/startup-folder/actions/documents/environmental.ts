"use server"

import { z } from "zod"

import { sendRequestReviewEmail } from "../send-request-review-email"
import prisma from "@/lib/prisma"

import type { UpdateStartupFolderDocumentSchema } from "@/project/startup-folder/schemas/update-file.schema"
import type { UploadStartupFolderDocumentSchema } from "@/project/startup-folder/schemas/new-file.schema"
import type { UpdateExpirationDateSchema } from "@/project/startup-folder/schemas/update-expiration-date"
import { DocumentCategory, ReviewStatus, type EnvironmentalDocType } from "@prisma/client"
import type { UploadResult } from "@/lib/upload-files"

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

export const updateEnvironmentalDocument = async ({
	data: { documentId, expirationDate, documentName, documentType },
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
		if (existingDocument.folder.status === ReviewStatus.APPROVED) {
			return {
				ok: false,
				message: "No puedes modificar documentos en esta carpeta porque ya fue aprobada",
			}
		}

		// Actualizar el documento
		const updatedDocument = await prisma.environmentalDocument.update({
			where: {
				id: documentId,
			},
			data: {
				expirationDate,
				status: "DRAFT",
				name: documentName,
				url: uploadedFile.url,
				uploadedAt: new Date(),
				type: documentType as EnvironmentalDocType,
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

export const updateExpirationDateEnvironmentalDocument = async ({
	data: { documentId, expirationDate },
}: {
	data: UpdateExpirationDateSchema
}) => {
	try {
		const existingDocument = await prisma.environmentalDocument.findUnique({
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

		const updatedDocument = await prisma.environmentalDocument.update({
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

export const submitEnvironmentalDocumentForReview = async ({
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
		const folder = await prisma.environmentalFolder.findUnique({
			where: { startupFolderId: folderId },
			select: {
				startupFolder: {
					select: {
						company: true,
					},
				},
				id: true,
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

		await prisma.environmentalFolder.update({
			where: { id: folder.id },
			data: {
				submittedAt: new Date(),
				status: ReviewStatus.SUBMITTED,
				additionalNotificationEmails: [...emails, user.email],
			},
		})

		const documents = await prisma.environmentalDocument.findMany({
			where: {
				folderId: folder.id,
			},
			select: {
				id: true,
				status: true,
			},
		})

		await Promise.all(
			documents.map(async (document) => {
				const newStatus =
					document.status === ReviewStatus.APPROVED ? ReviewStatus.APPROVED : ReviewStatus.SUBMITTED

				prisma.environmentalDocument.updateMany({
					where: {
						folderId: folder.id,
					},
					data: {
						status: newStatus,
						submittedAt: new Date(),
					},
				})
			})
		)

		await sendRequestReviewEmail({
			solicitator: {
				email: user.email,
				name: user.name,
				rut: user.rut,
				phone: user.phone,
			},
			companyName: folder.startupFolder.company.name,
			folderName: "Carpeta Medio Ambiente",
			documentCategory: DocumentCategory.ENVIRONMENTAL,
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
