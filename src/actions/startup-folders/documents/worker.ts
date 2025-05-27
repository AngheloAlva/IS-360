"use server"

import { ReviewStatus, type WorkerDocumentType } from "@prisma/client"
import { sendRequestReviewEmail } from "../send-request-review-email"
import prisma from "@/lib/prisma"
import { z } from "zod"

import type { UpdateStartupFolderDocumentSchema } from "@/lib/form-schemas/startup-folder/update-file.schema"
import type { UploadStartupFolderDocumentSchema } from "@/lib/form-schemas/startup-folder/new-file.schema"
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
				workerId_startupFolderId: {
					workerId,
					startupFolderId: folderId,
				},
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

export const submitWorkerDocumentForReview = async ({
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
			email: true,
		},
	})

	if (!user) {
		return { ok: false, message: "Usuario no encontrado." }
	}

	try {
		const folder = await prisma.workerFolder.findUnique({
			where: { id: folderId },
			include: {
				startupFolder: {
					select: {
						id: true,
						company: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		})

		if (!folder) {
			return { ok: false, message: "Carpeta no encontrada." }
		}

		if (folder.status !== ReviewStatus.DRAFT && folder.status !== ReviewStatus.REJECTED) {
			return {
				ok: false,
				message: `La carpeta no se puede enviar a revisión porque su estado actual es '${folder.status}'. Solo carpetas en DRAFT o REJECTED pueden ser enviadas.`,
			}
		}

		await prisma.$transaction(async (tx) => {
			const folders = await tx.workerFolder.findMany({
				where: {
					startupFolderId: folder.startupFolder.id,
				},
				select: {
					id: true,
				},
			})

			await tx.workerFolder.updateMany({
				where: { startupFolderId: folder.startupFolder.id },
				data: {
					submittedAt: new Date(),
					status: ReviewStatus.SUBMITTED,
					additionalNotificationEmails: [...emails, user.email],
				},
			})

			folders.forEach(async (folder) => {
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
		})

		await sendRequestReviewEmail({
			companyName: folder.startupFolder.company.name,
			folderName: "Carpeta de Trabajadores",
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
