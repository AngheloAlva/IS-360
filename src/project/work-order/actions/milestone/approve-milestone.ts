import { recomputeWorkOrderProgress } from "./_recompute-progress"
import { sendApproveMilestoneEmail, sendRejectMilestoneEmail } from "./send-close-milestone"
import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

interface RequestCloseMilestoneResponse {
	ok: boolean
	message: string
}

interface RequestCloseMilestoneParams {
	milestoneId: string
	closureComment?: string
}

// TODO(iter X): full implementation — advisory locks, TOCTOU re-read,
// auto-close OT when all milestones completed, auto-close email cascade
export async function approveMilestone({
	milestoneId,
	closureComment,
}: RequestCloseMilestoneParams): Promise<RequestCloseMilestoneResponse> {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const { rows } = await db.query<{
			id: string
			name: string
			status: string
			workOrderId: string
			otNumber: string
			supervisorEmail: string | null
		}>(
			`SELECT m."id", m."name", m."status", m."workOrderId",
				wo."otNumber", s."email" AS "supervisorEmail"
			FROM "milestone" m
			JOIN "work_order" wo ON wo."id" = m."workOrderId"
			LEFT JOIN "user" s ON s."id" = wo."supervisorId"
			WHERE m."id" = $1`,
			[milestoneId]
		)
		const milestone = rows[0]
		if (!milestone) return { ok: false, message: "El hito no existe" }
		if (milestone.status === "COMPLETED")
			return { ok: false, message: "El hito ya fue aprobado" }

		const now = new Date().toISOString()
		await db.query(
			`UPDATE "milestone" SET "status" = 'COMPLETED',
				"approvedAt" = $1, "approvedById" = $2, "closureComment" = $3, "updatedAt" = $1
			WHERE "id" = $4`,
			[now, user.id, closureComment ?? null, milestoneId]
		)

		await recomputeWorkOrderProgress(db, milestone.workOrderId, now)

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_ORDERS,
				action: ACTIVITY_TYPE.APPROVE,
				entityId: milestoneId,
				entityType: "Milestone",
				metadata: { name: milestone.name, workOrderId: milestone.workOrderId },
			})
		} catch {
			// audit best-effort
		}

		if (milestone.supervisorEmail) {
			await sendApproveMilestoneEmail({
				comment: closureComment,
				otNumber: milestone.otNumber,
				milestoneName: milestone.name,
				supervisorEmail: milestone.supervisorEmail,
			})
		}

		return { ok: true, message: "Hito aprobado correctamente" }
	} catch (error) {
		console.error("[APPROVE_MILESTONE]", error)
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Error al aprobar el hito",
		}
	}
}

// TODO(iter X): full implementation — reset milestone state cleanly,
// notify all stakeholders, audit before/after diff
export async function rejectMilestone({
	milestoneId,
	closureComment,
}: RequestCloseMilestoneParams): Promise<RequestCloseMilestoneResponse> {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const { rows } = await db.query<{
			id: string
			name: string
			workOrderId: string
			otNumber: string
			supervisorEmail: string | null
		}>(
			`SELECT m."id", m."name", m."workOrderId",
				wo."otNumber", s."email" AS "supervisorEmail"
			FROM "milestone" m
			JOIN "work_order" wo ON wo."id" = m."workOrderId"
			LEFT JOIN "user" s ON s."id" = wo."supervisorId"
			WHERE m."id" = $1`,
			[milestoneId]
		)
		const milestone = rows[0]
		if (!milestone) return { ok: false, message: "El hito no existe" }

		const now = new Date().toISOString()
		await db.query(
			`UPDATE "milestone" SET "status" = 'IN_PROGRESS',
				"isCompleted" = false, "closureComment" = $1, "updatedAt" = $2
			WHERE "id" = $3`,
			[closureComment ?? null, now, milestoneId]
		)

		await recomputeWorkOrderProgress(db, milestone.workOrderId, now)

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_ORDERS,
				action: ACTIVITY_TYPE.REJECT,
				entityId: milestoneId,
				entityType: "Milestone",
				metadata: { name: milestone.name, workOrderId: milestone.workOrderId },
			})
		} catch {
			// audit best-effort
		}

		if (milestone.supervisorEmail) {
			await sendRejectMilestoneEmail({
				comment: closureComment,
				otNumber: milestone.otNumber,
				milestoneName: milestone.name,
				supervisorEmail: milestone.supervisorEmail,
			})
		}

		return { ok: true, message: "Hito rechazado correctamente" }
	} catch (error) {
		console.error("[REJECT_MILESTONE]", error)
		return {
			ok: false,
			message:
				error instanceof Error ? error.message : "Error al rechazar el hito",
		}
	}
}
