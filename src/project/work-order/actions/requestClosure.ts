import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import { sendRequestClosureEmail } from "./sendRequestEmail"

interface RequestClosureParams {
	workBookId: string
}

export async function requestClosure({ workBookId }: RequestClosureParams) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()

		const { rows } = await db.query<{
			id: string
			otNumber: string
			supervisorId: string
			responsibleId: string
			companyId: string | null
			responsibleEmail: string
			responsibleName: string
			supervisorName: string
			companyName: string | null
			companyRut: string | null
		}>(
			`SELECT wo."id", wo."otNumber", wo."supervisorId", wo."responsibleId", wo."companyId",
				r."email" AS "responsibleEmail", r."name" AS "responsibleName",
				s."name" AS "supervisorName",
				c."name" AS "companyName", c."rut" AS "companyRut"
			FROM "work_order" wo
			LEFT JOIN "user" r ON r."id" = wo."responsibleId"
			LEFT JOIN "user" s ON s."id" = wo."supervisorId"
			LEFT JOIN "company" c ON c."id" = wo."companyId"
			WHERE wo."id" = $1 AND wo."deletedAt" IS NULL`,
			[workBookId]
		)
		const workOrder = rows[0]

		if (!workOrder) {
			return { ok: false, message: "Solicitud de cierre no encontrada" }
		}

		const now = new Date().toISOString()
		await db.query(
			`UPDATE "work_order" SET "status" = 'CLOSURE_REQUESTED',
				"closureRequestedById" = $1, "closureRequestedAt" = $2, "updatedAt" = $2
			WHERE "id" = $3`,
			[user.id, now, workBookId]
		)

		const entryId = crypto.randomUUID()
		await db.query(
			`INSERT INTO "work_book_entry" ("id", "entryType", "executionDate", "comments", "workOrderId", "createdById", "createdAt")
			 VALUES ($1, 'COMMENT', $2, $3, $4, $5, $2)`,
			[
				entryId,
				now,
				"Solicitud de cierre del libro de obras",
				workBookId,
				user.id,
			]
		)

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_ORDERS,
				action: ACTIVITY_TYPE.SUBMIT,
				entityId: workBookId,
				entityType: "WorkOrder",
				metadata: {
					status: "CLOSURE_REQUESTED",
					otNumber: workOrder.otNumber,
					workEntryId: entryId,
					companyId: workOrder.companyId,
					companyName: workOrder.companyName,
					supervisorId: workOrder.supervisorId,
					responsibleId: workOrder.responsibleId,
					closureRequestedAt: now,
				},
			})
		} catch {
			// audit best-effort
		}

		if (workOrder.responsibleEmail) {
			await sendRequestClosureEmail({
				workOrderId: workOrder.id,
				supervisorName: user.name,
				email: workOrder.responsibleEmail,
				workOrderNumber: workOrder.otNumber,
				workOrderName: `Libro de Obras ${workOrder.otNumber}`,
				companyName: workOrder.companyName
					? `${workOrder.companyName} - ${workOrder.companyRut ?? ""}`
					: "Interno",
			})
		}

		return { ok: true, message: "OK" }
	} catch (error) {
		console.error("[WORK_BOOK_REQUEST_CLOSURE]", error)
		return { ok: false, message: "Internal error" }
	}
}
