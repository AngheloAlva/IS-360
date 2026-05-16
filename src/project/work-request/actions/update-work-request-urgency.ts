import { z } from "zod"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

const updateWorkRequestUrgencySchema = z.object({
	id: z.string(),
	isUrgent: z.boolean(),
})

export async function updateWorkRequestUrgency(
	formData: z.infer<typeof updateWorkRequestUrgencySchema>,
) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No se pudo obtener la sesión del usuario" }
	}

	if (user.accessRole !== "ADMIN") {
		return { error: "No tienes permisos para realizar esta acción" }
	}

	try {
		const validatedData = updateWorkRequestUrgencySchema.parse(formData)
		const db = await getDemoDb()
		const now = new Date().toISOString()

		const updateResult = await db.query<Record<string, unknown>>(
			`UPDATE "work_request"
			 SET "isUrgent" = $1, "updatedAt" = $2
			 WHERE id = $3
			 RETURNING *`,
			[validatedData.isUrgent, now, validatedData.id],
		)
		const updated = updateResult.rows[0]
		if (!updated) {
			return { error: "Solicitud no encontrada" }
		}

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_REQUESTS,
				action: ACTIVITY_TYPE.UPDATE,
				entityId: validatedData.id,
				entityType: "WorkRequest",
				metadata: {
					requestNumber: updated.requestNumber,
					description: updated.description,
					isUrgent: updated.isUrgent,
					urgencyChanged: true,
				},
			})
		} catch {
			// audit best-effort
		}

		return {
			success: `Solicitud ${validatedData.isUrgent ? "marcada como urgente" : "desmarcada como urgente"} correctamente`,
			workRequest: updated,
		}
	} catch (error) {
		console.error("Error al actualizar la urgencia de la solicitud:", error)
		return { error: "Error al actualizar la urgencia de la solicitud" }
	}
}
