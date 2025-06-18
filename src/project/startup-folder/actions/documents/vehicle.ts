"use server"

import { z } from "zod"

import { DocumentCategory, ReviewStatus, type VehicleDocumentType } from "@prisma/client"
import prisma from "@/lib/prisma"

import type { UpdateStartupFolderDocumentSchema } from "@/project/startup-folder/schemas/update-file.schema"
import type { UploadStartupFolderDocumentSchema } from "@/project/startup-folder/schemas/new-file.schema"
import type { UpdateExpirationDateSchema } from "@/project/startup-folder/schemas/update-expiration-date"
import type { UploadResult } from "@/lib/upload-files"
import { sendRequestReviewEmail } from "../send-request-review-email"

export const createVehicleDocument = async ({
	data: { folderId, name, type, expirationDate, vehicleId, documentId },
	uploadedFile,
	userId,
}: {
	data: UploadStartupFolderDocumentSchema // This schema now includes vehicleId?: string
	uploadedFile: UploadResult
	userId: string
}) => {
	try {
		if (!vehicleId) throw new Error("Vehicle ID is required for creating vehicle document.")

		const folder = await prisma.vehicleFolder.findUnique({
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

		const document = await prisma.vehicleDocument.update({
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
				category: "VEHICLES",
				type: type as VehicleDocumentType,
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

export const updateVehicleDocument = async ({
	data: { documentId, expirationDate, documentName, documentType },
	uploadedFile,
	userId,
}: {
	data: UpdateStartupFolderDocumentSchema
	uploadedFile: UploadResult
	userId: string
}) => {
	try {
		const existingDocument = await prisma.vehicleDocument.findUnique({
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
		const updatedDocument = await prisma.vehicleDocument.update({
			where: {
				id: documentId,
			},
			data: {
				expirationDate,
				name: documentName,
				type: documentType as VehicleDocumentType,
				url: uploadedFile.url,
				status: "DRAFT",
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

export const updateExpirationDateVehicleDocument = async ({
	data: { documentId, expirationDate },
}: {
	data: UpdateExpirationDateSchema
}) => {
	try {
		const existingDocument = await prisma.vehicleDocument.findUnique({
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

		if (existingDocument.folder.status === ReviewStatus.APPROVED) {
			return {
				ok: false,
				message: "No puedes modificar documentos en esta carpeta porque ya fue aprobada",
			}
		}

		const updatedDocument = await prisma.vehicleDocument.update({
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

export const submitVehicleDocumentForReview = async ({
	emails,
	userId,
	companyId,
	vehicleId,
}: {
	userId: string
	emails: string[]
	folderId: string
	companyId: string
	vehicleId: string
}) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				email: true,
				rut: true,
				name: true,
				phone: true,
			},
		})

		if (!user) {
			return { ok: false, message: "Usuario no encontrado." }
		}

		await prisma.$transaction(async (tx) => {
			const folder = await tx.vehicleFolder.findFirst({
				where: {
					vehicleId,
				},
				select: {
					id: true,
					status: true,
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

			await tx.vehicleFolder.update({
				where: { id: folder.id },
				data: {
					submittedAt: new Date(),
					status: ReviewStatus.SUBMITTED,
					additionalNotificationEmails: [...emails, user.email],
				},
			})

			const documents = await prisma.vehicleDocument.findMany({
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

					await prisma.vehicleDocument.update({
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
				name: true,
			},
		})

		if (!company) {
			return { ok: false, message: "Empresa no encontrada." }
		}

		await sendRequestReviewEmail({
			documentCategory: DocumentCategory.VEHICLES,
			companyName: company.name,
			folderName: "Carpeta de Equipos y Vehículos",
			solicitator: {
				email: user.email,
				name: user.name,
				rut: user.rut,
				phone: user.phone,
			},
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
