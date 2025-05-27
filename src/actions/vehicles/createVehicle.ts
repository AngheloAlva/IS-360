"use server"

import { createVehicleStartupFolder } from "./createVehicleStartupFolder"
import prisma from "@/lib/prisma"

import type { VehicleSchema } from "@/lib/form-schemas/dashboard/vehicles/vehicle.schema"

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

		const res = await createVehicleStartupFolder(newVehicle.id)

		if (!res.ok) {
			return {
				ok: false,
				message: res.message,
			}
		}

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
