import { ACTIVITY_TYPE, MODULES, WORK_PERMIT_STATUS } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"
import {
	getScopedWorkPermitId,
	hasWorkPermitUpdatePermission,
} from "@/project/work-permit/utils/authorization"

import type { CloseWorkPermitSchema } from "../../schemas/close-work-permit.schema"

interface CloseWorkPermitProps {
	workPermitId: string
	values: CloseWorkPermitSchema
}

export const closeWorkPermit = async ({ values, workPermitId }: CloseWorkPermitProps) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	const { closedBy } = values
	const hasPermission = await hasWorkPermitUpdatePermission(user.id)
	if (!hasPermission) {
		return { ok: false, message: "No tienes permisos para cerrar permisos de trabajo" }
	}

	try {
		const db = await getDemoDb()

		const scopedId = await getScopedWorkPermitId({ workPermitId, userId: user.id })
		if (!scopedId) {
			return { ok: false, message: "Permiso de trabajo no encontrado" }
		}

		const now = new Date().toISOString()
		const updateResult = await db.query<{
			id: string
			status: string
			closingDate: string
			closingById: string
		}>(
			`UPDATE "work_permit"
			 SET status = $1, "closingDate" = $2, "closingById" = $3, "updatedAt" = $2
			 WHERE id = $4
			 RETURNING id, status, "closingDate", "closingById"`,
			[WORK_PERMIT_STATUS.COMPLETED, now, closedBy, scopedId],
		)
		const workPermit = updateResult.rows[0]

		const otResult = await db.query<{ otNumber: string | null; workBookName: string | null }>(
			`SELECT wo."otNumber", wo."workBookName"
			 FROM "work_permit" wp
			 LEFT JOIN "work_order" wo ON wo.id = wp."otNumberId"
			 WHERE wp.id = $1`,
			[scopedId],
		)

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_PERMITS,
				action: ACTIVITY_TYPE.COMPLETE,
				entityId: workPermit.id,
				entityType: "WorkPermit",
				metadata: {
					status: workPermit.status,
					closingDate: workPermit.closingDate,
					closingById: workPermit.closingById,
					otNumber: otResult.rows[0]?.otNumber,
					workBookName: otResult.rows[0]?.workBookName,
				},
			})
		} catch {
			// audit best-effort
		}

		return { ok: true, message: "Permiso de trabajo cerrado exitosamente" }
	} catch (error) {
		console.error("[CLOSE_WORK_PERMIT]", error)
		return { ok: false, message: "Error al cerrar el permiso de trabajo" }
	}
}
