"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { VehicleSchema } from "@/project/vehicle/schemas/vehicle.schema"

interface CreateVehicleProps {
	values: VehicleSchema
	companyId: string
}

export const createVehicle = async ({ values, companyId }: CreateVehicleProps) => {
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
		const newVehicle = await prisma.vehicle.create({
			data: {
				...values,
				company: {
					connect: {
						id: companyId,
					},
				},
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

		logActivity({
			userId: session.user.id,
			module: MODULES.VEHICLES,
			action: ACTIVITY_TYPE.CREATE,
			entityId: newVehicle.id,
			entityType: "Vehicle",
			metadata: {
				plate: newVehicle.plate,
				model: newVehicle.model,
				year: newVehicle.year,
				brand: newVehicle.brand,
				type: newVehicle.type,
				color: newVehicle.color,
				isMain: newVehicle.isMain,
				companyId: newVehicle.companyId,
			},
		})

		return {
			ok: true,
			message: "Vehículo creado exitosamente",
			vehicle: newVehicle,
		}
	} catch (error) {
		console.error("[CREATE_VEHICLE]", error)
		return {
			ok: false,
			message: "Error al crear vehículo",
		}
	}
}
