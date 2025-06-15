"use server"

import { DocumentCategory, ReviewStatus, type WorkerDocumentType } from "@prisma/client"
import { sendRequestReviewEmail } from "../send-request-review-email"
import prisma from "@/lib/prisma"
import { z } from "zod"

import type { UpdateStartupFolderDocumentSchema } from "@/project/startup-folder/schemas/update-file.schema"
import type { UploadStartupFolderDocumentSchema } from "@/project/startup-folder/schemas/new-file.schema"
import type { UpdateExpirationDateSchema } from "@/project/startup-folder/schemas/update-expiration-date"
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

		const folder = await prisma.workerFolder.findUnique({
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
				id: folderId,
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
				name: name || "",
				url: file.url,
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
			},
		})

		if (!existingDocument) {
			return { ok: false, message: "Documento no encontrado" }
		}

		if (!existingDocument.folder) {
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

export const updateExpirationDateWorkerDocument = async ({
	data: { documentId, expirationDate },
}: {
	data: UpdateExpirationDateSchema
}) => {
	try {
		const existingDocument = await prisma.workerDocument.findUnique({
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

		const updatedDocument = await prisma.workerDocument.update({
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

export const submitWorkerDocumentForReview = async ({
	userId,
	emails,
	folderId,
	companyId,
}: {
	userId: string
	emails: string[]
	folderId: string
	companyId: string
}) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				rut: true,
				name: true,
				phone: true,
				email: true,
			},
		})

		if (!user) {
			return { ok: false, message: "Usuario no encontrado." }
		}

		await prisma.$transaction(async (tx) => {
			const folders = await tx.workerFolder.findMany({
				where: {
					startupFolderId: folderId,
				},
				select: {
					id: true,
					status: true,
				},
			})

			if (folders.length === 0) {
				return { ok: false, message: "No se encontraron carpetas para esta carpeta." }
			}

			const invalidFolder = folders.find(
				(folder) => folder.status !== ReviewStatus.DRAFT && folder.status !== ReviewStatus.REJECTED
			)

			if (invalidFolder) {
				return {
					ok: false,
					message: `La carpeta no se puede enviar a revisión porque su estado actual es '${invalidFolder.status}'. Solo carpetas en DRAFT o REJECTED pueden ser enviadas.`,
				}
			}

			await Promise.all(
				folders.map(async (folder) => {
					await tx.workerFolder.update({
						where: { id: folder.id },
						data: {
							submittedAt: new Date(),
							status: ReviewStatus.SUBMITTED,
							additionalNotificationEmails: [...emails, user.email],
						},
					})

					await tx.workerDocument.updateMany({
						where: {
							folderId: folder.id,
						},
						data: {
							submittedAt: new Date(),
							status: ReviewStatus.SUBMITTED,
						},
					})
				})
			)
		})

		const company = await prisma.company.findUnique({
			where: {
				id: companyId,
			},
			select: {
				name: true,
			},
		})

		if (!company) {
			return { ok: false, message: "Empresa no encontrada." }
		}

		await sendRequestReviewEmail({
			solicitator: {
				name: user.name,
				rut: user.rut,
				phone: user.phone,
				email: user.email,
			},
			companyName: company.name,
			folderName: "Carpeta de Trabajadores",
			documentCategory: DocumentCategory.PERSONNEL,
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
