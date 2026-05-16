import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { createDiff } from "@/lib/activity/diff"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import type { INSPECTION_STATUS } from "@/generated/prisma/enums"

interface UpdateInspectionStatusParams {
	workEntryId: string
	status: INSPECTION_STATUS
}

export async function updateInspectionStatus({
	workEntryId,
	status,
}: UpdateInspectionStatusParams) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const { rows } = await db.query<{
			id: string
			entryType: string
			inspectionStatus: string | null
			workOrderId: string
		}>(
			`SELECT "id", "entryType", "inspectionStatus", "workOrderId"
			FROM "work_book_entry" WHERE "id" = $1`,
			[workEntryId]
		)
		const workEntry = rows[0]

		if (!workEntry) {
			return { ok: false, message: "Entrada no encontrada" }
		}

		if (workEntry.entryType !== "INTERNAL_INSPECTION") {
			return {
				ok: false,
				message: "Solo se puede cambiar el estado de inspecciones internas",
			}
		}

		await db.query(
			`UPDATE "work_book_entry" SET "inspectionStatus" = $1 WHERE "id" = $2`,
			[status, workEntryId]
		)

		const diff = createDiff(
			{ inspectionStatus: workEntry.inspectionStatus },
			{ inspectionStatus: status }
		)

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_ORDERS,
				action:
					status === "RESOLVED" ? ACTIVITY_TYPE.COMPLETE : ACTIVITY_TYPE.UPDATE,
				entityId: workEntry.id,
				entityType: "Inspection",
				...diff,
				metadata: {
					resolvedAt: status === "RESOLVED" ? new Date().toISOString() : null,
					workOrderId: workEntry.workOrderId,
				},
			})
		} catch {
			// audit best-effort
		}

		return {
			ok: true,
			message: `Inspección marcada como ${status === "RESOLVED" ? "resuelta" : "reportada"} correctamente`,
		}
	} catch (error) {
		console.error("Error updating inspection status:", error)
		return { ok: false, message: "Error interno del servidor" }
	}
}
