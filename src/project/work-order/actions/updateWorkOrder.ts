import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import type { InitializeWorkBookSchema } from "../schemas/initialize-work-book.schema"

interface UpdateWorkOrderLikeBook {
	workOrderId: string
	values: InitializeWorkBookSchema
}

export const updateWorkOrderLikeBook = async ({
	workOrderId,
	values,
}: UpdateWorkOrderLikeBook) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const now = new Date().toISOString()

		await db.query(
			`UPDATE "work_order" SET
				"isWorkBookInit" = true,
				"workBookName" = $1,
				"workBookLocation" = $2,
				"workBookStartDate" = $3,
				"updatedAt" = $4
			WHERE "id" = $5`,
			[
				values.workBookName,
				values.workBookLocation,
				new Date(values.workBookStartDate).toISOString(),
				now,
				workOrderId,
			]
		)

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_ORDERS,
				action: ACTIVITY_TYPE.UPDATE,
				entityId: workOrderId,
				entityType: "WorkOrder",
				metadata: {
					isWorkBookInit: true,
					workBookName: values.workBookName,
					workBookLocation: values.workBookLocation,
					workBookStartDate: values.workBookStartDate,
				},
			})
		} catch {
			// audit best-effort
		}

		return {
			ok: true,
			message: "Libro de obras actualizado exitosamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al actualizar el libro de obras",
		}
	}
}
