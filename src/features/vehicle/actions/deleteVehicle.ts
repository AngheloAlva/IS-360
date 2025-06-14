"use server"

import prisma from "@/lib/prisma"

interface DeleteVehicleProps {
	vehicleId: string
	companyId: string
}

export const deleteVehicle = async ({ vehicleId, companyId }: DeleteVehicleProps) => {
	try {
		const vehicle = await prisma.vehicle.findUnique({
			where: {
				id: vehicleId,
				companyId,
			},
		})

		if (!vehicle) {
			return {
				ok: false,
				message: "Vehículo no encontrado o no tienes permisos para eliminarlo",
			}
		}

		await prisma.vehicle.update({
			where: {
				id: vehicleId,
			},
			data: {
				isActive: false,
			},
		})

		return {
			ok: true,
			message: "Vehículo eliminado exitosamente",
		}
	} catch (error) {
		console.error("Error al eliminar vehículo:", error)
		return {
			ok: false,
			message: "Error al eliminar vehículo",
		}
	}
}
