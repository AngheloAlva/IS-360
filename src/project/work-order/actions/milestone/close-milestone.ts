import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"
import { sendRequestCloseMilestoneEmail } from "./send-close-milestone"

interface RequestCloseMilestoneResponse {
	ok: boolean
	message: string
}

interface RequestCloseMilestoneParams {
	milestoneId: string
}

export async function requestCloseMilestone({
	milestoneId,
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
			weight: number
			description: string | null
			workOrderId: string
			otNumber: string
			workBookName: string | null
			workDescription: string | null
			responsibleEmail: string | null
		}>(
			`SELECT m."id", m."name", m."weight", m."description", m."workOrderId",
				wo."otNumber", wo."workBookName", wo."workDescription",
				r."email" AS "responsibleEmail"
			FROM "milestone" m
			JOIN "work_order" wo ON wo."id" = m."workOrderId"
			LEFT JOIN "user" r ON r."id" = wo."responsibleId"
			WHERE m."id" = $1`,
			[milestoneId]
		)
		const milestone = rows[0]

		if (!milestone) {
			return { ok: false, message: "El hito no existe" }
		}

		const now = new Date().toISOString()
		await db.query(
			`UPDATE "milestone" SET "status" = 'REQUESTED_CLOSURE',
				"isCompleted" = true, "requestedById" = $1, "updatedAt" = $2
			WHERE "id" = $3`,
			[user.id, now, milestoneId]
		)

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_ORDERS,
				action: ACTIVITY_TYPE.SUBMIT,
				entityId: milestoneId,
				entityType: "Milestone",
				metadata: {
					name: milestone.name,
					weight: milestone.weight,
					workOrderId: milestone.workOrderId,
					otNumber: milestone.otNumber,
					status: "REQUESTED_CLOSURE",
				},
			})
		} catch {
			// audit best-effort
		}

		if (milestone.responsibleEmail) {
			await sendRequestCloseMilestoneEmail({
				milestone: {
					name: milestone.name,
					weight: milestone.weight,
					description: milestone.description,
					workOrderId: milestone.workOrderId,
					workOrder: {
						otNumber: milestone.otNumber,
						workBookName: milestone.workBookName,
						workDescription: milestone.workDescription,
					},
				},
				responsibleEmail: milestone.responsibleEmail,
			})
		}

		return { ok: true, message: "Hito cerrado correctamente" }
	} catch (error) {
		console.error("Error al guardar los hitos:", error)
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Error al guardar los hitos",
		}
	}
}
