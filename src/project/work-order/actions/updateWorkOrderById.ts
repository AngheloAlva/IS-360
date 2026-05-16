import { ACTIVITY_TYPE, MODULES, WORK_ORDER_STATUS } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import type { UpdateWorkOrderSchema } from "@/project/work-order/schemas/updateWorkOrder.schema"
import type { UploadResult } from "@/lib/upload-files"

interface UpdateWorkOrderParams {
	id: string
	values: UpdateWorkOrderSchema
	endReport?: UploadResult[]
}

interface UpdateWorkOrderResponse {
	ok: boolean
	message?: string
}

export const updateWorkOrderById = async ({
	id,
	values,
	endReport,
}: UpdateWorkOrderParams): Promise<UpdateWorkOrderResponse> => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const progress = Number(values.progress?.[0] ?? 0)

		let status: WORK_ORDER_STATUS
		if (progress === 100) {
			status = "COMPLETED"
		} else if (progress > 0) {
			status = "IN_PROGRESS"
		} else {
			const { rows: countRows } = await db.query<{ count: string }>(
				`SELECT COUNT(*)::text AS count FROM "work_book_entry" WHERE "workOrderId" = $1`,
				[id]
			)
			const hasActivities = Number(countRows[0]?.count ?? 0)
			status = hasActivities > 0 ? "IN_PROGRESS" : "PENDING"
		}

		const now = new Date().toISOString()
		const endDate =
			values.status === "COMPLETED" || progress === 100 ? now : null
		const estimatedEndDateIso = values.estimatedEndDate
			? new Date(values.estimatedEndDate).toISOString()
			: null

		let endReportId: string | null = null
		if (endReport?.length) {
			endReportId = crypto.randomUUID()
			await db.query(
				`INSERT INTO "attachment" ("id", "name", "url", "type", "size", "createdAt", "updatedAt", "endReportId")
				 VALUES ($1, $2, $3, $4, $5, $6, $6, $1)`,
				[
					endReportId,
					endReport[0].name,
					endReport[0].url,
					endReport[0].type,
					endReport[0].size ?? null,
					now,
				]
			)
		}

		await db.query(
			`UPDATE "work_order" SET
				"type" = $1,
				"capex" = $2,
				"priority" = $3,
				"progress" = $4,
				"programDate" = $5,
				"workRequest" = $6,
				"workDescription" = $7,
				"solicitationDate" = $8,
				"solicitationTime" = $9,
				"estimatedEndDate" = $10,
				"rescheduledEndDate" = $11,
				"estimatedDays" = $12,
				"estimatedHours" = $13,
				"status" = $14,
				"endDate" = $15,
				"companyId" = $16,
				"supervisorId" = $17,
				"responsibleId" = $18,
				${endReportId ? `"endReportId" = $20,` : ""}
				"updatedAt" = $19
			WHERE "id" = ${endReportId ? "$21" : "$20"}`,
			endReportId
				? [
						values.type,
						values.capex,
						values.priority,
						progress,
						new Date(values.programDate).toISOString(),
						values.workRequest,
						values.workDescription ?? null,
						new Date(values.solicitationDate).toISOString(),
						values.solicitationTime,
						estimatedEndDateIso,
						values.rescheduledEndDate
							? new Date(values.rescheduledEndDate).toISOString()
							: null,
						parseInt(values.estimatedDays),
						parseInt(values.estimatedHours),
						status,
						endDate,
						values.companyId,
						values.supervisorId,
						values.responsibleId,
						now,
						endReportId,
						id,
					]
				: [
						values.type,
						values.capex,
						values.priority,
						progress,
						new Date(values.programDate).toISOString(),
						values.workRequest,
						values.workDescription ?? null,
						new Date(values.solicitationDate).toISOString(),
						values.solicitationTime,
						estimatedEndDateIso,
						values.rescheduledEndDate
							? new Date(values.rescheduledEndDate).toISOString()
							: null,
						parseInt(values.estimatedDays),
						parseInt(values.estimatedHours),
						status,
						endDate,
						values.companyId,
						values.supervisorId,
						values.responsibleId,
						now,
						id,
					]
		)

		// Reset equipment many-to-many
		await db.query(`DELETE FROM "_EquipmentToWorkOrder" WHERE "B" = $1`, [id])
		for (const equipmentId of values.equipment) {
			await db.query(
				`INSERT INTO "_EquipmentToWorkOrder" ("A", "B") VALUES ($1, $2)
				 ON CONFLICT DO NOTHING`,
				[equipmentId, id]
			)
		}

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_ORDERS,
				action: ACTIVITY_TYPE.UPDATE,
				entityId: id,
				entityType: "WorkOrder",
				metadata: {
					type: values.type,
					status,
					priority: values.priority,
					progress,
				},
			})
		} catch {
			// audit best-effort
		}

		return {
			ok: true,
			message: "Orden de trabajo actualizada exitosamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al actualizar la orden de trabajo",
		}
	}
}
