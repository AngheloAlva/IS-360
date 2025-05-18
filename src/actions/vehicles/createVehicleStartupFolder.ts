"use server"

import { VEHICLE_STRUCTURE } from "@/lib/consts/startup-folders-structure"
import prisma from "@/lib/prisma"

import { VehicleDocumentType } from "@prisma/client"

export const createVehicleStartupFolder = async (vehicleId: string) => {
	try {
		const vehicle = await prisma.vehicle.findUnique({
			where: {
				id: vehicleId,
			},
			select: {
				id: true,
				companyId: true,
			},
		})

		if (!vehicle || !vehicle.companyId) {
			return {
				ok: false,
				message: "Vehículo no encontrado",
			}
		}

		const startupFolder = await prisma.startupFolder.findFirst({
			where: {
				companyId: vehicle.companyId,
			},
			select: {
				id: true,
			},
		})

		if (!startupFolder) {
			return {
				ok: false,
				message: "No se encontró la carpeta inicial",
			}
		}

		const documentsToCreate = VEHICLE_STRUCTURE.documents
			.map((doc) => {
				if (doc.type === VehicleDocumentType.EQUIPMENT_FILE) return

				return {
					url: "",
					name: doc.name,
					fileType: "FILE",
					required: doc.required,
					category: VEHICLE_STRUCTURE.category,
					type: doc.type as VehicleDocumentType,
					folder: {
						connect: {
							id: startupFolder.id,
						},
					},
				}
			})
			.filter((doc) => doc !== undefined)

		await prisma.vehicleFolder.create({
			data: {
				vehicle: {
					connect: {
						id: vehicleId,
					},
				},
				startupFolder: {
					connect: {
						id: startupFolder.id,
					},
				},
				...(documentsToCreate.length > 0 && {
					documents: {
						create: documentsToCreate,
					},
				}),
			},
		})

		return {
			ok: true,
			message: "Carpeta inicial creada exitosamente",
		}
	} catch (error) {
		console.error("[CREATE_USER_STARTUP_FOLDER]", error)
		return {
			ok: false,
			message: "Error al crear la carpeta inicial",
		}
	}
}
