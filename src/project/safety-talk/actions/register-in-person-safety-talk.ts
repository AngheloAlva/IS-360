import { z } from "zod"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import {
	inPersonSafetyTalkSchema,
	type InPersonSafetyTalkSchema,
} from "../schemas/in-person-safety-talk.schema"
import { normalizeRut } from "../utils/normalize-rut"

export async function registerInPersonSafetyTalk(data: InPersonSafetyTalkSchema) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const validated = inPersonSafetyTalkSchema.parse(data)
		const expiresAt =
			validated.expiresAt ??
			new Date(validated.sessionDate.getTime() + 365 * 24 * 60 * 60 * 1000)

		const id = crypto.randomUUID()
		const now = new Date().toISOString()
		const db = await getDemoDb()
		const insertRes = await db.query<Record<string, unknown>>(
			`INSERT INTO "in_person_safety_talk_record" (
				"id", "rut", "name", "company", "category", "sessionDate", "expiresAt",
				"score", "notes", "status", "source", "registeredById",
				"createdAt", "updatedAt"
			) VALUES (
				$1, $2, $3, $4, $5, $6, $7,
				$8, $9, $10, 'MANUAL', $11,
				$12, $12
			) RETURNING *`,
			[
				id,
				normalizeRut(validated.rut),
				validated.name,
				validated.company,
				validated.category,
				validated.sessionDate.toISOString(),
				expiresAt.toISOString(),
				validated.score ?? null,
				validated.notes ?? null,
				validated.status,
				user.id,
				now,
			],
		)
		const record = insertRes.rows[0]

		await logActivity({
			userId: user.id,
			module: MODULES.SAFETY_TALK,
			action: ACTIVITY_TYPE.CREATE,
			entityId: id,
			entityType: "InPersonSafetyTalkRecord",
			metadata: {
				rut: record.rut,
				name: record.name,
				company: record.company,
				category: record.category,
				sessionDate: record.sessionDate,
				score: record.score,
				status: record.status,
				source: "MANUAL",
			},
		})

		return {
			ok: true,
			message: "Registro de charla presencial creado correctamente",
			record,
		}
	} catch (error) {
		console.error("[REGISTER_IN_PERSON_SAFETY_TALK]", error)
		if (error instanceof z.ZodError) {
			return { ok: false, message: "Datos inválidos", errors: error.issues }
		}
		return { ok: false, message: "Error al crear el registro de charla presencial" }
	}
}
