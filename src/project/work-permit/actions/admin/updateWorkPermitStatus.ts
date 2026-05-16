import { z } from "zod"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

const updateWorkPermitStatusSchema = z.object({
	id: z.string(),
	workCompleted: z.boolean(),
})

export async function updateWorkPermitStatus(
	data: z.infer<typeof updateWorkPermitStatusSchema>,
) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const { id, workCompleted } = updateWorkPermitStatusSchema.parse(data)

		const db = await getDemoDb()
		const now = new Date().toISOString()

		const updateResult = await db.query<{ id: string; workCompleted: boolean }>(
			`UPDATE "work_permit"
			 SET "workCompleted" = $1, "updatedAt" = $2
			 WHERE id = $3
			 RETURNING id, "workCompleted"`,
			[workCompleted, now, id],
		)
		const workPermit = updateResult.rows[0]
		if (!workPermit) {
			return { ok: false, message: "Permiso de trabajo no encontrado" }
		}

		const otResult = await db.query<{ otNumber: string | null; workBookName: string | null }>(
			`SELECT wo."otNumber", wo."workBookName"
			 FROM "work_permit" wp
			 LEFT JOIN "work_order" wo ON wo.id = wp."otNumberId"
			 WHERE wp.id = $1`,
			[id],
		)

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_PERMITS,
				action: workCompleted ? ACTIVITY_TYPE.COMPLETE : ACTIVITY_TYPE.UPDATE,
				entityId: workPermit.id,
				entityType: "WorkPermit",
				metadata: {
					workCompleted: workPermit.workCompleted,
					otNumber: otResult.rows[0]?.otNumber,
					workBookName: otResult.rows[0]?.workBookName,
				},
			})
		} catch {
			// audit best-effort
		}

		return {
			ok: true,
			message: workCompleted
				? "Permiso de trabajo completado exitosamente"
				: "Estado del permiso de trabajo actualizado exitosamente",
		}
	} catch (error) {
		console.error("[UPDATE_WORK_PERMIT_STATUS]", error)
		if (error instanceof z.ZodError) {
			return { ok: false, message: "Datos inválidos" }
		}
		return { ok: false, message: "Error al actualizar el estado del permiso de trabajo" }
	}
}
