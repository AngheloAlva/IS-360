import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { generateSlug } from "@/lib/generateSlug"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import type { MaintenancePlanSchema } from "@/project/maintenance-plan/schemas/maintenance-plan.schema"

interface CreateMaintenancePlanValues {
	values: MaintenancePlanSchema
}

export const createMaintenancePlan = async ({ values }: CreateMaintenancePlanValues) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const planSlug = generateSlug(values.name)

		const conflict = await db.query<{ id: string }>(
			`SELECT id FROM "maintenance_plan" WHERE slug = $1 OR name = $2 LIMIT 1`,
			[planSlug, values.name],
		)
		if (conflict.rows.length > 0) {
			return {
				ok: false,
				code: "NAME_ALREADY_EXISTS",
				message: "El nombre del plan de mantenimiento ya existe",
			}
		}

		const id = crypto.randomUUID()
		const now = new Date().toISOString()

		await db.query(
			`INSERT INTO "maintenance_plan" (id, slug, name, description, "equipmentId", "createdById", "createdAt", "updatedAt")
			 VALUES ($1, $2, $3, '', $4, $5, $6, $6)`,
			[id, planSlug, values.name, values.equipmentId, values.createdById, now],
		)

		try {
			await logActivity({
				userId: values.createdById,
				module: MODULES.MAINTENANCE_PLANS,
				action: ACTIVITY_TYPE.CREATE,
				entityId: id,
				entityType: "MaintenancePlan",
				metadata: { name: values.name, equipmentId: values.equipmentId, slug: planSlug },
			})
		} catch {
			// audit best-effort
		}

		return { ok: true, message: "Plan de mantenimiento creado exitosamente" }
	} catch (error) {
		console.error("[CREATE_MAINTENANCE_PLAN]", error)
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Error al crear el plan de mantenimiento",
		}
	}
}
