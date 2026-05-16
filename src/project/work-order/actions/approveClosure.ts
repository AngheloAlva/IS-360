import { sendApproveClosureEmail } from "./sendApproveEmail"
import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

interface ApproveWorkBookClosureProps {
	workBookId: string
}

export async function approveWorkBookClosure({
	workBookId,
}: ApproveWorkBookClosureProps) {
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
			companyName: string | null
		}>(
			`SELECT wo."id", wo."status", wo."otNumber", wo."workBookName",
				cr."email" AS "closureRequestedEmail",
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
			return { ok: false, message: "No hay solicitud de cierre pendiente" }
		}

		const now = new Date().toISOString()
		await db.query(
			`UPDATE "work_order" SET "status" = 'COMPLETED',
				"closureApprovedById" = $1, "closureApprovedAt" = $2, "updatedAt" = $2
			WHERE "id" = $3`,
			[user.id, now, workBookId]
		)

		const entryId = crypto.randomUUID()
		await db.query(
			`INSERT INTO "work_book_entry" ("id", "entryType", "executionDate", "comments", "workOrderId", "createdById", "createdAt")
			 VALUES ($1, 'COMMENT', $2, $3, $4, $5, $2)`,
			[entryId, now, "Cierre del libro de obras aprobado", workBookId, user.id]
		)

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_ORDERS,
				action: ACTIVITY_TYPE.APPROVE,
				entityId: workOrder.id,
				entityType: "WorkOrder",
				metadata: {
					status: "COMPLETED",
					otNumber: workOrder.otNumber,
					workBookName: workOrder.workBookName,
					closureApprovedById: user.id,
					closureApprovedAt: now,
					workEntryId: entryId,
				},
			})
		} catch {
			// audit best-effort
		}

		if (workOrder.closureRequestedEmail) {
			await sendApproveClosureEmail({
				supervisorName: user.name,
				workOrderNumber: workOrder.otNumber,
				workOrderName: workOrder.workBookName || "",
				email: workOrder.closureRequestedEmail,
				companyName: workOrder.companyName || "Interno",
			})
		}

		return {
			ok: true,
			message: "Cierre del libro de obras aprobado exitosamente",
		}
	} catch (error) {
		console.error("[WORK_BOOK_APPROVE_CLOSURE]", error)
		return {
			ok: false,
			message: "Error al aprobar el cierre del libro de obras",
		}
	}
}
