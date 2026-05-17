import { z } from "zod"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

const approveSafetyTalkSchema = z.object({
	safetyTalkId: z.string(),
})

export async function approveSafetyTalk(data: z.infer<typeof approveSafetyTalkSchema>) {
	const user = getDemoUser()
	if (!user) {
		throw new Error("No autorizado")
	}

	const validated = approveSafetyTalkSchema.parse(data)
	const db = await getDemoDb()

	const res = await db.query<{
		status: string
		score: number | null
		minRequiredScore: number
		userId: string
	}>(
		`SELECT status, score, "minRequiredScore", "userId"
		 FROM "user_safety_talk" WHERE id = $1`,
		[validated.safetyTalkId],
	)
	const safetyTalk = res.rows[0]
	if (!safetyTalk) {
		throw new Error("Charla de seguridad no encontrada")
	}
	if (safetyTalk.status !== "PASSED") {
		throw new Error("La charla debe estar en estado PASSED para ser aprobada manualmente")
	}
	if (!safetyTalk.score || safetyTalk.score < safetyTalk.minRequiredScore) {
		throw new Error("El puntaje no cumple con el mínimo requerido")
	}

	const now = new Date().toISOString()
	const updateRes = await db.query<{ id: string; userId: string }>(
		`UPDATE "user_safety_talk"
		 SET status = 'MANUALLY_APPROVED', "approvalById" = $1, "updatedAt" = $2
		 WHERE id = $3
		 RETURNING id, "userId"`,
		[user.id, now, validated.safetyTalkId],
	)
	const updated = updateRes.rows[0]

	await logActivity({
		userId: user.id,
		module: MODULES.SAFETY_TALK,
		action: ACTIVITY_TYPE.APPROVE,
		entityId: updated.id,
		entityType: "UserSafetyTalk",
		metadata: {
			previousStatus: safetyTalk.status,
			newStatus: "MANUALLY_APPROVED",
			score: safetyTalk.score,
			minRequiredScore: safetyTalk.minRequiredScore,
			approvedUserId: updated.userId,
		},
	})

	return updated
}
