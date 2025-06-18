"use server"

import prisma from "@/lib/prisma"

import type { VehicleSchema } from "@/project/vehicle/schemas/vehicle.schema"

interface CreateVehicleProps {
	values: VehicleSchema
	companyId: string
}

export const createVehicle = async ({ values, companyId }: CreateVehicleProps) => {
	try {
		const newVehicle = await prisma.vehicle.create({
			data: {
				...values,
				company: {
					connect: {
						id: companyId,
					},
				},
			},
		})

		return {
			ok: true,
			message: "Vehículo creado exitosamente",
			vehicle: newVehicle,
		}
	} catch (error) {
		console.error("Error al crear vehículo:", error)
		return {
			ok: false,
			message: "Error al crear vehículo",
		}
	}
}
