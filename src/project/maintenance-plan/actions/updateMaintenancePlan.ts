import { type MaintenancePlanSchema } from "../schemas/maintenance-plan.schema"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

interface UpdateMaintenancePlanProps {
	values: MaintenancePlanSchema
	slug: string
}

export async function updateMaintenancePlan({ values, slug }: UpdateMaintenancePlanProps) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()

		const existing = await db.query<{ id: string }>(
			`SELECT id FROM "maintenance_plan" WHERE slug = $1`,
			[slug],
		)
		if (existing.rows.length === 0) {
			return { ok: false, message: "Plan de mantenimiento no encontrado" }
		}

		const conflict = await db.query<{ id: string }>(
			`SELECT id FROM "maintenance_plan" WHERE name = $1 AND slug <> $2 LIMIT 1`,
			[values.name, slug],
		)
		if (conflict.rows.length > 0) {
			return {
				ok: false,
				code: "NAME_ALREADY_EXISTS",
				message: "Ya existe un plan de mantenimiento con ese nombre",
			}
		}

		const now = new Date().toISOString()
		await db.query(
			`UPDATE "maintenance_plan"
			 SET name = $1, "equipmentId" = $2, "updatedAt" = $3
			 WHERE slug = $4`,
			[values.name, values.equipmentId, now, slug],
		)

		return { ok: true, message: "Plan de mantenimiento actualizado exitosamente" }
	} catch (error) {
		console.error("[UPDATE_MAINTENANCE_PLAN]", error)
		return { ok: false, message: "Error al actualizar el plan de mantenimiento" }
	}
}
