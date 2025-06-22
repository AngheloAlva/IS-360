"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { UpdateVehicleSchema } from "@/project/vehicle/schemas/vehicle.schema"

interface UpdateVehicleProps {
	values: UpdateVehicleSchema
	companyId: string
}

export const updateVehicle = async ({ values, companyId }: UpdateVehicleProps) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const { id, ...vehicleData } = values

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
			select: {
				id: true,
				plate: true,
				model: true,
				year: true,
				brand: true,
				type: true,
				color: true,
				isMain: true,
				companyId: true,
			},
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.VEHICLES,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: updatedVehicle.id,
			entityType: "Vehicle",
			metadata: {
				plate: updatedVehicle.plate,
				model: updatedVehicle.model,
				year: updatedVehicle.year,
				brand: updatedVehicle.brand,
				type: updatedVehicle.type,
				color: updatedVehicle.color,
				isMain: updatedVehicle.isMain,
				companyId: updatedVehicle.companyId,
				updatedFields: Object.keys(vehicleData),
			},
		})

		return {
			ok: true,
			message: "Vehículo actualizado exitosamente",
			vehicle: updatedVehicle,
		}
	} catch (error) {
		console.error("[UPDATE_VEHICLE]", error)
		return {
			ok: false,
			message: "Error al actualizar vehículo",
		}
	}
}
