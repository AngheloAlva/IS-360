import {
	ACTIVITY_SEVERITY,
	ACTIVITY_TYPE,
	MODULES,
	type SAFETY_TALK_CATEGORY,
} from "@/generated/prisma/enums"
import { createDiff } from "@/lib/activity/diff"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import { UnblockUserSchema } from "../schemas/attempt.schema"

export async function unblockUser(data: unknown) {
	try {
		const user = getDemoUser()
		if (!user) {
			return { success: false, error: "No autenticado" }
		}
		if (user.accessRole !== "ADMIN") {
			return { success: false, error: "No tienes permisos para desbloquear usuarios" }
		}

		const { userId, category, reason } = UnblockUserSchema.parse(data)
		const db = await getDemoDb()

		const res = await db.query<{ id: string; status: string; currentAttempts: number }>(
			`SELECT id, status, "currentAttempts"
			 FROM "user_safety_talk"
			 WHERE "userId" = $1 AND category = $2
			 LIMIT 1`,
			[userId, category],
		)
		const userSafetyTalk = res.rows[0]
		if (!userSafetyTalk) {
			return { success: false, error: "No se encontró el registro de la charla" }
		}
		if (userSafetyTalk.status !== "BLOCKED") {
			return { success: false, error: "El usuario no está bloqueado" }
		}

		const now = new Date().toISOString()
		await db.query(
			`UPDATE "user_safety_talk"
			 SET status = 'PENDING', "currentAttempts" = 0, "nextAttemptAt" = NULL, "updatedAt" = $1
			 WHERE id = $2`,
			[now, userSafetyTalk.id],
		)

		const diff = createDiff(
			{ status: "BLOCKED", currentAttempts: userSafetyTalk.currentAttempts },
			{ status: "PENDING", currentAttempts: 0 },
		)

		await logActivity({
			userId: user.id,
			module: MODULES.SAFETY_TALK,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: userSafetyTalk.id,
			entityType: "UserSafetyTalk",
			severity: ACTIVITY_SEVERITY.HIGH,
			...diff,
			metadata: {
				unblocked: true,
				targetUserId: userId,
				category,
				reason,
			},
		})

		return { success: true, message: "Usuario desbloqueado exitosamente" }
	} catch (error) {
		console.error("[UNBLOCK_USER]", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "Error al desbloquear usuario",
		}
	}
}

export async function getUserSafetyTalkStatus(userId: string, category: SAFETY_TALK_CATEGORY) {
	try {
		const user = getDemoUser()
		if (!user) {
			return { success: false, error: "No autenticado" }
		}

		const canAccess = user.id === userId || user.accessRole === "ADMIN"
		if (!canAccess) {
			return { success: false, error: "No autorizado para consultar este estado" }
		}

		const db = await getDemoDb()
		const res = await db.query<{
			id: string
			status: string
			currentAttempts: number
			nextAttemptAt: string | null
			score: number | null
			completedAt: string | null
			expiresAt: string | null
		}>(
			`SELECT id, status, "currentAttempts", "nextAttemptAt", score, "completedAt", "expiresAt"
			 FROM "user_safety_talk"
			 WHERE "userId" = $1 AND category = $2
			 LIMIT 1`,
			[userId, category],
		)
		const row = res.rows[0]
		if (!row) {
			return { success: true, status: null, message: "No ha iniciado esta charla" }
		}

		return {
			success: true,
			status: {
				id: row.id,
				status: row.status,
				currentAttempts: row.currentAttempts,
				nextAttemptAt: row.nextAttemptAt,
				score: row.score,
				completedAt: row.completedAt,
				expiresAt: row.expiresAt,
			},
		}
	} catch (error) {
		console.error("[GET_USER_SAFETY_TALK_STATUS]", error)
		return { success: false, error: "Error al obtener el estado" }
	}
}
