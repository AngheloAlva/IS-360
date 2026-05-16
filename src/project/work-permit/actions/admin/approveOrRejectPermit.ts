import { ACTIVITY_TYPE, MODULES, WORK_PERMIT_STATUS } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"
import {
	getScopedWorkPermitId,
	hasWorkPermitUpdatePermission,
} from "@/project/work-permit/utils/authorization"

import type { ApproveWorkPermitSchema } from "../../schemas/approve-work-permit.schema"

interface ApproveWorkPermitProps {
	workPermitId: string
	values: ApproveWorkPermitSchema
}

export const approveOrRejectWorkPermit = async ({
	values,
	workPermitId,
}: ApproveWorkPermitProps) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	const { action, approvedBy, approvalNotes, extraParticipants } = values
	const hasPermission = await hasWorkPermitUpdatePermission(user.id)
	if (!hasPermission) {
		return {
			ok: false,
			message: "No tienes permisos para aprobar o rechazar permisos de trabajo",
		}
	}

	try {
		const db = await getDemoDb()

		const scopedId = await getScopedWorkPermitId({ workPermitId, userId: user.id })
		if (!scopedId) {
			return { ok: false, message: "Permiso de trabajo no encontrado" }
		}

		const newStatus =
			action === "approve" ? WORK_PERMIT_STATUS.ACTIVE : WORK_PERMIT_STATUS.REJECTED
		const now = new Date().toISOString()

		const updateResult = await db.query<{
			id: string
			status: string
			approvalDate: string
			approvalById: string
		}>(
			`UPDATE "work_permit"
			 SET status = $1, "approvalDate" = $2, "approvalNotes" = $3,
				 "approvalById" = $4, "updatedAt" = $2
			 WHERE id = $5
			 RETURNING id, status, "approvalDate", "approvalById"`,
			[newStatus, now, approvalNotes ?? null, approvedBy, scopedId],
		)
		const workPermit = updateResult.rows[0]

		if (extraParticipants && extraParticipants.length > 0) {
			for (const p of extraParticipants) {
				await db.query(
					`INSERT INTO "_WorkPermitParticipants" ("A", "B") VALUES ($1, $2)
					 ON CONFLICT DO NOTHING`,
					[p, scopedId],
				)
			}
		}

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
				action: action === "approve" ? ACTIVITY_TYPE.APPROVE : ACTIVITY_TYPE.REJECT,
				entityId: workPermit.id,
				entityType: "WorkPermit",
				metadata: {
					status: workPermit.status,
					approvalDate: workPermit.approvalDate,
					approvalById: workPermit.approvalById,
					otNumber: otResult.rows[0]?.otNumber,
					workBookName: otResult.rows[0]?.workBookName,
				},
			})
		} catch {
			// audit best-effort
		}

		return {
			ok: true,
			message:
				action === "approve"
					? "Permiso de trabajo aprobado exitosamente"
					: "Permiso de trabajo rechazado exitosamente",
		}
	} catch (error) {
		console.error("[APPROVE_OR_REJECT_WORK_PERMIT]", error)
		return {
			ok: false,
			message:
				action === "approve"
					? "Error al aprobar el permiso de trabajo"
					: "Error al rechazar el permiso de trabajo",
		}
	}
}
