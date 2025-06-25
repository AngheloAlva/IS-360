"use server"

import { revalidatePath } from "next/cache"

import { type MaintenancePlanSchema } from "../schemas/maintenance-plan.schema"
import prisma from "@/lib/prisma"

interface UpdateMaintenancePlanProps {
	values: MaintenancePlanSchema
	slug: string
}

export async function updateMaintenancePlan({ values, slug }: UpdateMaintenancePlanProps) {
	try {
		const existingPlan = await prisma.maintenancePlan.findUnique({
			where: { slug },
		})

		if (!existingPlan) {
			return {
				ok: false,
				message: "Plan de mantenimiento no encontrado",
			}
		}

		const nameExists = await prisma.maintenancePlan.findFirst({
			where: {
				name: values.name,
				slug: { not: slug },
			},
		})

		if (nameExists) {
			return {
				ok: false,
				code: "NAME_ALREADY_EXISTS",
				message: "Ya existe un plan de mantenimiento con ese nombre",
			}
		}

		await prisma.maintenancePlan.update({
			where: { slug },
			data: {
				name: values.name,
				equipmentId: values.equipmentId,
			},
		})

		revalidatePath("/maintenance-plans")

		return {
			ok: true,
			message: "Plan de mantenimiento actualizado exitosamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al actualizar el plan de mantenimiento",
		}
	}
}
