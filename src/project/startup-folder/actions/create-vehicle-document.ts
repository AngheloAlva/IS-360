"use server"

import { z } from "zod"

import prisma from "@/lib/prisma"

import type { VehicleDocumentType } from "@prisma/client"

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
			throw new Error("Carpeta de vehiculo no encontrada")
		}

		// Verify user belongs to the company
		const user = await prisma.user.findUnique({ where: { id: userId } })
		if (!user || user.companyId !== vehicleFolder.vehicle.companyId) {
			throw new Error("No autorizado - El vehiculo no pertenece a la empresa")
		}

		await prisma.vehicleDocument.create({
			data: {
				type: documentType as VehicleDocumentType,
				name: documentName,
				url,
				category: "VEHICLES",
				uploadedById: userId,
				folderId: vehicleFolder.id,
				expirationDate,
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
