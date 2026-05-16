import { ACTIVITY_TYPE, MODULES, WORK_ORDER_STATUS } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

interface BulkCloseWorkOrdersParams {
	workOrderIds: string[]
	reason?: string
}

export async function bulkCloseWorkOrders({
	workOrderIds,
	reason,
}: BulkCloseWorkOrdersParams) {
	const user = getDemoUser()
	if (!user) {
		throw new Error("No autorizado")
	}

	try {
		const db = await getDemoDb()
		if (workOrderIds.length === 0) {
			throw new Error("No se encontraron órdenes de trabajo válidas para cerrar")
		}

		const placeholders = workOrderIds.map((_, i) => `$${i + 1}`).join(", ")
		const { rows: allSelected } = await db.query<{
			id: string
			otNumber: string
			status: string
		}>(
			`SELECT "id", "otNumber", "status" FROM "work_order"
			WHERE "id" IN (${placeholders}) AND "deletedAt" IS NULL`,
			workOrderIds
		)

		const workOrders = allSelected.filter(
			(wo) => wo.status !== WORK_ORDER_STATUS.COMPLETED
		)

		if (workOrders.length === 0) {
			if (
				allSelected.length > 0 &&
				allSelected.every((wo) => wo.status === WORK_ORDER_STATUS.COMPLETED)
			) {
				throw new Error("Las órdenes de trabajo seleccionadas ya están cerradas")
			}
			throw new Error("No se encontraron órdenes de trabajo válidas para cerrar")
		}

		const now = new Date().toISOString()
		const targetIds = workOrders.map((wo) => wo.id)
		const inPlaceholders = targetIds.map((_, i) => `$${i + 4}`).join(", ")

		await db.query(
			`UPDATE "work_order" SET "progress" = 100, "endDate" = $1,
				"status" = 'COMPLETED', "closureRejectedReason" = $2, "updatedAt" = $3
			WHERE "id" IN (${inPlaceholders})`,
			[now, reason || null, now, ...targetIds]
		)

		await Promise.all(
			workOrders.map((wo) =>
				logActivity({
					action: ACTIVITY_TYPE.UPDATE,
					userId: user.id,
					module: MODULES.WORK_ORDERS,
					entityId: wo.id,
					entityType: "WORK_ORDER",
					metadata: {
						workOrder: wo,
						reason: reason || "No especificado",
					},
				}).catch(() => undefined)
			)
		)

		return {
			ok: true,
			message: `Se cerraron exitosamente ${workOrders.length} órdenes de trabajo`,
		}
	} catch (error) {
		console.error("[BULK_CLOSE_WORK_ORDERS]", error)
		throw new Error(
			error instanceof Error ? error.message : "Error al cerrar órdenes de trabajo"
		)
	}
}
