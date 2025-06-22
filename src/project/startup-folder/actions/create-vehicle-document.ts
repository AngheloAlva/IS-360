"use server"

import { z } from "zod"

import { ACTIVITY_TYPE, DocumentCategory, MODULES, type VehicleDocumentType } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import prisma from "@/lib/prisma"

const createVehicleDocumentSchema = z.object({
	url: z.string(),
	userId: z.string(),
	vehicleId: z.string(),
	documentType: z.string(),
	documentName: z.string(),
	expirationDate: z.date(),
	startupFolderId: z.string(),
})

export type CreateVehicleDocumentInput = z.infer<typeof createVehicleDocumentSchema>

export async function createVehicleDocument(input: CreateVehicleDocumentInput) {
	try {
		const { userId, vehicleId, documentType, documentName, url, expirationDate, startupFolderId } =
			createVehicleDocumentSchema.parse(input)

		const vehicleFolder = await prisma.vehicleFolder.findUnique({
			where: { vehicleId_startupFolderId: { startupFolderId, vehicleId } },
			select: {
				id: true,
				vehicle: {
					select: {
						id: true,
						companyId: true,
					},
				},
			},
		})

		if (!vehicleFolder) {
			return {
				ok: false,
				message: "Carpeta de vehiculo no encontrada",
			}
		}

		const user = await prisma.user.findUnique({ where: { id: userId } })
		if (!user || user.companyId !== vehicleFolder.vehicle.companyId) {
			return {
				ok: false,
				message: "No autorizado - El vehiculo no pertenece a la empresa",
			}
		}

		const document = await prisma.vehicleDocument.create({
			data: {
				type: documentType as VehicleDocumentType,
				name: documentName,
				url,
				category: DocumentCategory.VEHICLES,
				uploadedById: userId,
				folderId: vehicleFolder.id,
				expirationDate,
			},
		})

		if (!document) {
			return {
				ok: false,
				message: "Error al crear el documento",
			}
		}

		logActivity({
			userId,
			module: MODULES.STARTUP_FOLDERS,
			action: ACTIVITY_TYPE.UPLOAD,
			entityId: document.id,
			entityType: "VehicleDocument",
			metadata: {
				documentName,
				documentType,
				vehicleId,
				startupFolderId,
				expirationDate: expirationDate.toISOString(),
			},
		})

		return {
			ok: true,
			message: "Documento de vehiculo subido correctamente",
		}
	} catch (error) {
		console.error(error)

		return {
			ok: false,
			message: "Ocurrio un problema al subir el documento",
		}
	}
}
