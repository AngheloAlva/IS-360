"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { generateSlug } from "@/lib/generateSlug"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { MaintenancePlanSchema } from "@/project/maintenance-plan/schemas/maintenance-plan.schema"
import type { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

interface CreateMaintenancePlanValues {
	values: MaintenancePlanSchema
}

export const createMaintenancePlan = async ({ values }: CreateMaintenancePlanValues) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permission: {
				maintenancePlan: ["create"],
			},
		},
	})

	if (!hasPermission) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const planSlug = generateSlug(values.name)

		const maintenancePlan = await prisma.maintenancePlan.create({
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

		logActivity({
			userId: values.createdById,
			module: MODULES.MAINTENANCE_PLANS,
			action: ACTIVITY_TYPE.CREATE,
			entityId: maintenancePlan.id,
			entityType: "MaintenancePlan",
			metadata: {
				name: values.name,
				equipmentId: values.equipmentId,
				slug: planSlug,
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
