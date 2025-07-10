"use server"

import { VehicleDocumentType } from "@prisma/client"
import prisma from "@/lib/prisma"

import type { UpdateStartupFolderDocumentSchema } from "@/project/startup-folder/schemas/update-file.schema"
import type { UploadResult } from "@/lib/upload-files"

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
