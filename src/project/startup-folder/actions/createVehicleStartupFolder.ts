"use server"

import prisma from "@/lib/prisma"

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

		await prisma.vehicleFolder.create({
			data: {
				vehicle: {
					connect: {
						id: vehicleId,
					},
				},
			},
		})

		return {
			ok: true,
			message: "Carpeta inicial creada exitosamente",
		}
	} catch (error) {
		console.error("[CREATE_VEHICLE_STARTUP_FOLDER]", error)
		return {
			ok: false,
			message: "Error al crear la carpeta inicial",
		}
	}
}
