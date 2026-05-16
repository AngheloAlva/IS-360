import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

interface DeleteWorkOrderProps {
	workOrderId: string
}

export const deleteWorkOrder = async ({ workOrderId }: DeleteWorkOrderProps) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()

		const { rows } = await db.query<{
			id: string
			otNumber: string
			type: string
			status: string
			priority: string
			deletedAt: string | null
			supervisorId: string
			responsibleId: string
			companyId: string | null
		}>(
			`SELECT "id", "otNumber", "type", "status", "priority", "deletedAt",
				"supervisorId", "responsibleId", "companyId"
			FROM "work_order" WHERE "id" = $1`,
			[workOrderId]
		)
		const workOrder = rows[0]

		if (!workOrder) {
			return { ok: false, message: "Orden de trabajo no encontrada" }
		}

		if (workOrder.deletedAt) {
			return { ok: false, message: "La orden de trabajo ya fue eliminada" }
		}

		if (workOrder.status !== "PLANNED" && workOrder.status !== "PENDING") {
			return {
				ok: false,
				message:
					"Solo se pueden eliminar órdenes en estado Planificada o Pendiente",
			}
		}

		const { rows: milestoneRows } = await db.query<{ count: string }>(
			`SELECT COUNT(*)::text AS count FROM "milestone" WHERE "workOrderId" = $1`,
			[workOrderId]
		)
		const { rows: entryRows } = await db.query<{ count: string }>(
			`SELECT COUNT(*)::text AS count FROM "work_book_entry" WHERE "workOrderId" = $1`,
			[workOrderId]
		)

		if (Number(milestoneRows[0]?.count ?? 0) > 0 || Number(entryRows[0]?.count ?? 0) > 0) {
			return {
				ok: false,
				message:
					"Solo se pueden eliminar órdenes sin hitos, actividades diarias ni inspecciones",
			}
		}

		const now = new Date().toISOString()
		await db.query(
			`UPDATE "work_order" SET "deletedAt" = $1, "deletedById" = $2, "updatedAt" = $1 WHERE "id" = $3`,
			[now, user.id, workOrderId]
		)

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_ORDERS,
				action: ACTIVITY_TYPE.DELETE,
				entityId: workOrder.id,
				entityType: "WorkOrder",
				changesBefore: {
					otNumber: workOrder.otNumber,
					type: workOrder.type,
					status: workOrder.status,
					priority: workOrder.priority,
					supervisorId: workOrder.supervisorId,
					responsibleId: workOrder.responsibleId,
					companyId: workOrder.companyId,
				},
				metadata: {
					otNumber: workOrder.otNumber,
					reason: "soft-delete (delete-empty)",
				},
			})
		} catch {
			// audit best-effort
		}

		return { ok: true, message: "Orden de trabajo eliminada exitosamente" }
	} catch (error) {
		console.error("[DELETE_WORK_ORDER]", error)
		return { ok: false, message: "Error al eliminar la orden de trabajo" }
	}
}
