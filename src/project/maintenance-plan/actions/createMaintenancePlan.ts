"use server"

import { generateSlug } from "@/lib/generateSlug"
import prisma from "@/lib/prisma"

import type { MaintenancePlanSchema } from "@/project/maintenance-plan/schemas/maintenance-plan.schema"
import type { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

interface CreateMaintenancePlanValues {
	values: MaintenancePlanSchema
}

export const createMaintenancePlan = async ({ values }: CreateMaintenancePlanValues) => {
	try {
		const planSlug = generateSlug(values.name)

		await prisma.maintenancePlan.create({
			data: {
				slug: planSlug,
				description: "",
				name: values.name,
				equipment: {
					connect: {
						id: values.equipmentId,
					},
				},
				createdBy: {
					connect: {
						id: values.createdById,
					},
				},
			},
		})

		return {
			ok: true,
			message: "Plan de mantenimiento creado exitosamente",
		}
	} catch (error) {
		if (error && (error as PrismaClientKnownRequestError).code) {
			if ((error as PrismaClientKnownRequestError).code === "P2002") {
				return {
					ok: false,
					code: "NAME_ALREADY_EXISTS",
					message: "El nombre del plan de mantenimiento ya existe",
				}
			}
		}
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Error al crear el plan de mantenimiento",
		}
	}
}
