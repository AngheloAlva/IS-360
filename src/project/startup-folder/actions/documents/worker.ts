"use server"

import { z } from "zod"

import { DocumentCategory, ReviewStatus, type WorkerDocumentType } from "@prisma/client"
import { sendRequestReviewEmail } from "../emails/send-request-review-email"
import prisma from "@/lib/prisma"

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
	data: { documentId, expirationDate, documentName, documentType },
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

		if (existingDocument.folder.status === ReviewStatus.APPROVED) {
			return {
				ok: false,
				message: "No puedes modificar documentos en esta carpeta porque ya fue aprobada",
			}
		}

		// Actualizar el documento
		const updatedDocument = await prisma.workerDocument.update({
			where: {
				id: documentId,
			},
			data: {
				url: file.url,
				expirationDate,
				name: documentName,
				type: documentType as WorkerDocumentType,
				uploadedAt: new Date(),
				status: "DRAFT",
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
	workerId,
	folderId,
	companyId,
}: {
	userId: string
	emails: string[]
	folderId: string
	workerId: string
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

		const folder = await prisma.workerFolder.findUnique({
			where: {
				workerId_startupFolderId: {
					workerId,
					startupFolderId: folderId,
				},
			},
			select: {
				id: true,
				status: true,
				worker: {
					select: {
						name: true,
						rut: true,
						phone: true,
						email: true,
					},
				},
				startupFolder: {
					select: {
						name: true,
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
			return { ok: false, message: "No se encontró la carpeta." }
		}

		const invalidFolder =
			folder.status !== ReviewStatus.DRAFT && folder.status !== ReviewStatus.REJECTED

		if (invalidFolder) {
			return {
				ok: false,
				message: `La carpeta no se puede enviar a revisión porque su estado actual es '${folder.status}'. Solo carpetas en DRAFT o REJECTED pueden ser enviadas.`,
			}
		}

		await prisma.$transaction(async (tx) => {
			await tx.workerFolder.update({
				where: { id: folder.id },
				data: {
					submittedAt: new Date(),
					status: ReviewStatus.SUBMITTED,
					additionalNotificationEmails: [...emails, user.email],
				},
			})

			const documents = await prisma.workerDocument.findMany({
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
						document.status === ReviewStatus.APPROVED
							? ReviewStatus.APPROVED
							: ReviewStatus.SUBMITTED

					await prisma.workerDocument.update({
						where: {
							id: document.id,
						},
						data: {
							status: newStatus,
							submittedAt: new Date(),
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
				id: true,
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
			solicitationDate: new Date(),
			documentCategory: DocumentCategory.PERSONNEL,
			folderName: folder.startupFolder.name + " - " + folder.worker.name,
			reviewUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard/carpetas-de-arranques/${company.id}`,
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
