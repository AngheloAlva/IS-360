import { z } from "zod"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import { irlSafetyTalkSchema, type IrlSafetyTalkSchema } from "../schemas/irl-safety-talk.schema"

export async function registerIrlSafetyTalk(data: IrlSafetyTalkSchema) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const validated = irlSafetyTalkSchema.parse(data)
		const approvedEmployees = validated.employees.filter((e) => e.approved)

		if (!approvedEmployees.length) {
			return { ok: false, message: "No hay empleados aprobados para registrar" }
		}

		const db = await getDemoDb()
		const now = new Date().toISOString()
		const results: Array<{ userId: string; action: "updated" | "created"; safetyTalkId: string }> = []

		for (const employee of approvedEmployees) {
			const sessionDateIso = employee.sessionDate!.toISOString()
			const expiresAtIso = employee.expiresAt!.toISOString()
			const score = parseInt(employee.score!, 10)

			if (employee.talksId) {
				const upd = await db.query<{ id: string }>(
					`UPDATE "user_safety_talk"
					 SET "approvalById" = $1, "expiresAt" = $2, score = $3, "completedAt" = $4,
					     "manuallyApproved" = true, "inPersonSessionDate" = $4, status = 'PASSED', "updatedAt" = $5
					 WHERE id = $6
					 RETURNING id`,
					[user.id, expiresAtIso, score, sessionDateIso, now, employee.talksId],
				)
				if (upd.rows[0]) {
					results.push({ userId: employee.userId, action: "updated", safetyTalkId: upd.rows[0].id })
					continue
				}
			}

			const existingRes = await db.query<{ id: string }>(
				`SELECT id FROM "user_safety_talk"
				 WHERE "userId" = $1 AND category = 'IRL' AND "expiresAt" > $2
				 LIMIT 1`,
				[employee.userId, now],
			)
			if (existingRes.rows[0]) {
				await db.query(
					`UPDATE "user_safety_talk"
					 SET "approvalById" = $1, "expiresAt" = $2, score = $3, "completedAt" = $4,
					     "manuallyApproved" = true, "inPersonSessionDate" = $4, status = 'PASSED', "updatedAt" = $5
					 WHERE id = $6`,
					[user.id, expiresAtIso, score, sessionDateIso, now, existingRes.rows[0].id],
				)
				results.push({
					userId: employee.userId,
					action: "updated",
					safetyTalkId: existingRes.rows[0].id,
				})
				continue
			}

			const newId = crypto.randomUUID()
			await db.query(
				`INSERT INTO "user_safety_talk" (
					"id", "userId", category, status, "currentAttempts", "approvalById",
					"expiresAt", score, "completedAt", "manuallyApproved", "inPersonSessionDate",
					"createdAt", "updatedAt"
				) VALUES (
					$1, $2, 'IRL', 'PASSED', 1, $3,
					$4, $5, $6, true, $6,
					$7, $7
				)`,
				[newId, employee.userId, user.id, expiresAtIso, score, sessionDateIso, now],
			)
			results.push({ userId: employee.userId, action: "created", safetyTalkId: newId })
		}

		for (const result of results) {
			await logActivity({
				userId: user.id,
				module: MODULES.SAFETY_TALK,
				action: ACTIVITY_TYPE.CREATE,
				entityId: result.safetyTalkId,
				entityType: "UserSafetyTalk",
				metadata: {
					category: "IRL",
					action: result.action,
					targetUserId: result.userId,
					manuallyApproved: true,
				},
			})
		}

		return {
			ok: true,
			message: "Registros de charlas IRL procesados correctamente",
			results,
		}
	} catch (error) {
		console.error("[REGISTER_IRL_SAFETY_TALK]", error)
		if (error instanceof z.ZodError) {
			return { ok: false, message: "Datos inválidos", errors: error.issues }
		}
		return { ok: false, message: "Error al procesar los registros de charlas IRL" }
	}
}
