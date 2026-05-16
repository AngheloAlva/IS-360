import { sendRejectClosureEmail } from "./sendRejectClosure"
import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

interface RejectClosureProps {
	reason?: string
	workBookId: string
}

export async function rejectClosure({ workBookId, reason }: RejectClosureProps) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const { rows } = await db.query<{
			id: string
			status: string
			otNumber: string
			workBookName: string | null
			closureRequestedEmail: string | null
			closureRequestedName: string | null
			closureRequestedId: string | null
			companyId: string | null
			companyName: string | null
		}>(
			`SELECT wo."id", wo."status", wo."otNumber", wo."workBookName",
				wo."closureRequestedById" AS "closureRequestedId",
				cr."email" AS "closureRequestedEmail",
				cr."name" AS "closureRequestedName",
				wo."companyId",
				c."name" AS "companyName"
			FROM "work_order" wo
			LEFT JOIN "user" cr ON cr."id" = wo."closureRequestedById"
			LEFT JOIN "company" c ON c."id" = wo."companyId"
			WHERE wo."id" = $1 AND wo."deletedAt" IS NULL`,
			[workBookId]
		)
		const workOrder = rows[0]

		if (!workOrder) {
			return { ok: false, message: "Libro de obras no encontrado" }
		}

		if (workOrder.status !== "CLOSURE_REQUESTED") {
			return { ok: false, message: "No hay una solicitud de cierre pendiente" }
		}

		const now = new Date().toISOString()
		await db.query(
			`UPDATE "work_order" SET "status" = 'IN_PROGRESS',
				"closureRejectedReason" = $1, "updatedAt" = $2
			WHERE "id" = $3`,
			[reason || null, now, workBookId]
		)

		const entryId = crypto.randomUUID()
		const comment = `Solicitud de cierre rechazada${reason ? `: ${reason}` : ""}`
		await db.query(
			`INSERT INTO "work_book_entry" ("id", "entryType", "executionDate", "comments", "workOrderId", "createdById", "createdAt")
			 VALUES ($1, 'COMMENT', $2, $3, $4, $5, $2)`,
			[entryId, now, comment, workBookId, user.id]
		)

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_ORDERS,
				action: ACTIVITY_TYPE.REJECT,
				entityId: workBookId,
				entityType: "WorkOrder",
				metadata: {
					status: "IN_PROGRESS",
					otNumber: workOrder.otNumber,
					workBookName: workOrder.workBookName,
					reason,
					workEntryId: entryId,
					companyId: workOrder.companyId,
					companyName: workOrder.companyName,
					closureRequestedById: workOrder.closureRequestedId,
					closureRequestedByName: workOrder.closureRequestedName,
				},
			})
		} catch {
			// audit best-effort
		}

		if (workOrder.closureRequestedEmail) {
			await sendRejectClosureEmail({
				rejectionReason: reason,
				supervisorName: user.name,
				workOrderNumber: workOrder.otNumber,
				workOrderName: workOrder.workBookName || "",
				email: workOrder.closureRequestedEmail,
				companyName: workOrder.companyName || "Interno",
			})
		}

		return { ok: true, message: "OK" }
	} catch (error) {
		console.error("[WORK_BOOK_REJECT_CLOSURE]", error)
		return { ok: false, message: "Error al rechazar el cierre" }
	}
}
