import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

export const deleteMaintenancePlan = async (maintenancePlanId: string) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const now = new Date().toISOString()

		const result = await db.query<{
			id: string
			name: string
			slug: string
			equipmentId: string
		}>(
			`UPDATE "maintenance_plan"
			 SET "isActive" = false, "updatedAt" = $1
			 WHERE id = $2
			 RETURNING id, name, slug, "equipmentId"`,
			[now, maintenancePlanId],
		)
		const plan = result.rows[0]
		if (!plan) {
			return { ok: false, message: "Plan de mantenimiento no encontrado" }
		}

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.MAINTENANCE_PLANS,
				action: ACTIVITY_TYPE.DELETE,
				entityId: plan.id,
				entityType: "MaintenancePlan",
				metadata: { name: plan.name, slug: plan.slug, equipmentId: plan.equipmentId },
			})
		} catch {
			// audit best-effort
		}

		return { ok: true, message: "Plan de mantenimiento eliminado correctamente" }
	} catch (error) {
		console.error("[DELETE_MAINTENANCE_PLAN]", error)
		return { ok: false, message: "Error al eliminar el plan de mantenimiento" }
	}
}
