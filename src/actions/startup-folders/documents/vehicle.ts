"use server"

import prisma from "@/lib/prisma"

import type { UpdateStartupFolderDocumentSchema } from "@/lib/form-schemas/startup-folder/update-file.schema"
import type { UploadStartupFolderDocumentSchema } from "@/lib/form-schemas/startup-folder/new-file.schema"
import type { VehicleDocumentType } from "@prisma/client"
import type { UploadResult } from "@/lib/upload-files"

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
		const folder = await prisma.startupFolder.findUnique({
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
				fileType: uploadedFile.type,
				type: type as VehicleDocumentType,
				...(vehicleId && { vehicle: { connect: { id: vehicleId } } }), // Conditionally connect vehicle
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
	data: { documentId, expirationDate },
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
