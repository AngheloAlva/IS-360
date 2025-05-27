"use server"

import prisma from "@/lib/prisma"

import type { UpdateVehicleSchema } from "@/lib/form-schemas/dashboard/vehicles/vehicle.schema"

interface UpdateVehicleProps {
	values: UpdateVehicleSchema
	companyId: string
}

export const updateVehicle = async ({ values, companyId }: UpdateVehicleProps) => {
	try {
		const { id, ...vehicleData } = values

		// Verificar que el vehículo pertenezca a la empresa del usuario
		const vehicle = await prisma.vehicle.findFirst({
			where: {
				id,
				companyId,
			},
		})

		if (!vehicle) {
			return {
				ok: false,
				message: "Vehículo no encontrado o no tienes permisos para editarlo",
			}
		}

		const updatedVehicle = await prisma.vehicle.update({
			where: {
				id,
			},
			data: vehicleData,
		})

		return {
			ok: true,
			message: "Vehículo actualizado exitosamente",
			vehicle: updatedVehicle,
		}
	} catch (error) {
		console.error("Error al actualizar vehículo:", error)
		return {
			ok: false,
			message: "Error al actualizar vehículo",
		}
	}
}
