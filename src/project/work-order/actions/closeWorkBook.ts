import { sendCloseWorkBookEmail } from "./sendCloseWorkBookEmail"
import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

interface CloseWorkBookProps {
	reason: string
	progress: number
	workBookId: string
}

export async function closeWorkBook({
	workBookId,
	reason,
	progress,
}: CloseWorkBookProps) {
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
			supervisorEmail: string | null
			companyId: string | null
			companyName: string | null
		}>(
			`SELECT wo."id", wo."status", wo."otNumber", wo."workBookName",
				s."email" AS "supervisorEmail",
				wo."companyId", c."name" AS "companyName"
			FROM "work_order" wo
			LEFT JOIN "user" s ON s."id" = wo."supervisorId"
			LEFT JOIN "company" c ON c."id" = wo."companyId"
			WHERE wo."id" = $1 AND wo."deletedAt" IS NULL`,
			[workBookId]
		)
		const workOrder = rows[0]

		if (!workOrder) {
			return { ok: false, message: "Libro de obras no encontrado" }
		}

		const now = new Date().toISOString()
		await db.query(
			`UPDATE "work_order" SET "progress" = $1, "status" = 'COMPLETED',
				"endDate" = $2, "closureRejectedReason" = $3, "updatedAt" = $2
			WHERE "id" = $4`,
			[progress, now, reason || null, workBookId]
		)

		const entryId = crypto.randomUUID()
		const comment = `Libro de obras cerrado ${reason ? `: ${reason}` : ""}`
		await db.query(
			`INSERT INTO "work_book_entry" ("id", "entryType", "executionDate", "comments", "workOrderId", "createdById", "createdAt")
			 VALUES ($1, 'COMMENT', $2, $3, $4, $5, $2)`,
			[entryId, now, comment, workBookId, user.id]
		)

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_ORDERS,
				action: ACTIVITY_TYPE.CANCEL,
				entityId: workOrder.id,
				entityType: "WorkOrder",
				metadata: {
					status: "COMPLETED",
					otNumber: workOrder.otNumber,
					workBookName: workOrder.workBookName,
					closureRejectedReason: reason,
					workEntryId: entryId,
					companyId: workOrder.companyId,
					companyName: workOrder.companyName,
					closureReason: reason,
				},
			})
		} catch {
			// audit best-effort
		}

		if (workOrder.supervisorEmail) {
			await sendCloseWorkBookEmail({
				closureReason: reason,
				otNumber: workOrder.otNumber,
				supervisorName: user.name,
				email: workOrder.supervisorEmail,
				workOrderNumber: workOrder.otNumber,
				workOrderName: workOrder.workBookName || "",
				companyName: workOrder.companyName || "Interno",
			})
		}

		return { ok: true, message: "Libro de obras cerrado exitosamente" }
	} catch (error) {
		console.error("[WORK_BOOK_CLOSE]", error)
		return { ok: false, message: "Error al cerrar el libro de obras" }
	}
}
