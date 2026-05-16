import { z } from "zod"

import { sendWorkRequestStatusUpdateEmail } from "./send-work-request-status-update"
import { ACTIVITY_TYPE, MODULES, WORK_REQUEST_STATUS } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

const updateWorkRequestStatusSchema = z.object({
	id: z.string(),
	status: z.enum([
		WORK_REQUEST_STATUS.REPORTED,
		WORK_REQUEST_STATUS.APPROVED,
		WORK_REQUEST_STATUS.ATTENDED,
		WORK_REQUEST_STATUS.CANCELLED,
	]),
})

export async function updateWorkRequestStatus(
	formData: z.infer<typeof updateWorkRequestStatusSchema>,
) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No se pudo obtener la sesión del usuario" }
	}

	try {
		const validatedData = updateWorkRequestStatusSchema.parse(formData)
		const db = await getDemoDb()
		const now = new Date().toISOString()

		const beforeResult = await db.query<{
			requestNumber: string
			description: string
			userId: string
		}>(
			`SELECT "requestNumber", description, "userId" FROM "work_request" WHERE id = $1`,
			[validatedData.id],
		)
		const before = beforeResult.rows[0]
		if (!before) {
			return { error: "Solicitud no encontrada" }
		}

		const updateResult = await db.query<Record<string, unknown>>(
			`UPDATE "work_request"
			 SET status = $1, "updatedAt" = $2
			 WHERE id = $3
			 RETURNING *`,
			[validatedData.status, now, validatedData.id],
		)
		const updated = updateResult.rows[0]

		const userResult = await db.query<{ name: string; email: string }>(
			`SELECT name, email FROM "user" WHERE id = $1`,
			[before.userId],
		)
		const requestUser = userResult.rows[0]
		if (requestUser?.email) {
			try {
				await sendWorkRequestStatusUpdateEmail({
					userEmail: requestUser.email,
					userName: requestUser.name || "Usuario",
					requestNumber: before.requestNumber,
					status: validatedData.status,
					description: before.description,
				})
			} catch {
				// email best-effort
			}
		}

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_REQUESTS,
				action: ACTIVITY_TYPE.UPDATE,
				entityId: validatedData.id,
				entityType: "WorkRequest",
				metadata: {
					requestNumber: before.requestNumber,
					description: before.description,
				},
			})
		} catch {
			// audit best-effort
		}

		return { success: "Estado actualizado correctamente", workRequest: updated }
	} catch (error) {
		console.error("Error al actualizar el estado de la solicitud:", error)
		return { error: "Error al actualizar el estado de la solicitud" }
	}
}
