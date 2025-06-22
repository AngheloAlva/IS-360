"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface DeleteVehicleProps {
	vehicleId: string
	companyId: string
}

export const deleteVehicle = async ({ vehicleId, companyId }: DeleteVehicleProps) => {
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
		const vehicle = await prisma.vehicle.findUnique({
			where: {
				id: vehicleId,
				companyId,
			},
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

		logActivity({
			userId: session.user.id,
			module: MODULES.VEHICLES,
			action: ACTIVITY_TYPE.DELETE,
			entityId: vehicle.id,
			entityType: "Vehicle",
			metadata: {
				plate: vehicle.plate,
				model: vehicle.model,
				year: vehicle.year,
				brand: vehicle.brand,
				type: vehicle.type,
				color: vehicle.color,
				isMain: vehicle.isMain,
				companyId: vehicle.companyId,
			},
		})

		return {
			ok: true,
			message: "Vehículo eliminado exitosamente",
		}
	} catch (error) {
		console.error("[DELETE_VEHICLE]", error)
		return {
			ok: false,
			message: "Error al eliminar vehículo",
		}
	}
}
