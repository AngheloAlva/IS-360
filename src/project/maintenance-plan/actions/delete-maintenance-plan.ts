"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const deleteMaintenancePlan = async (maintenancePlanId: string) => {
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
				maintenancePlan: ["delete"],
			},
		},
	})

	if (!hasPermission) {
		return {
			ok: false,
			message: "No tienes permisos para eliminar el plan de mantenimiento",
		}
	}

	try {
		const maintenancePlan = await prisma.maintenancePlan.update({
			where: { id: maintenancePlanId },
			data: { isActive: false },
			select: {
				id: true,
				name: true,
				slug: true,
				equipmentId: true,
			},
		})

  await logActivity({
			userId: session.user.id,
			module: MODULES.MAINTENANCE_PLANS,
			action: ACTIVITY_TYPE.DELETE,
			entityId: maintenancePlan.id,
			entityType: "MaintenancePlan",
			metadata: {
				name: maintenancePlan.name,
				slug: maintenancePlan.slug,
				equipmentId: maintenancePlan.equipmentId,
			},
		})

		return {
			ok: true,
			message: "Plan de mantenimiento eliminado correctamente",
		}
	} catch (error) {
		console.error("[DELETE_MAINTENANCE_PLAN]", error)
		return {
			ok: false,
			message: "Error al eliminar el plan de mantenimiento",
		}
	}
}
