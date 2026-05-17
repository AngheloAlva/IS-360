import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { SYSTEM_USER_ID } from "@/lib/consts/system-user"
import { getDemoDb } from "@/lib/demo-db/client"

import { type VisitorDataSchema } from "@/project/safety-talk/schemas/external-company.schema"

type UpdateVisitorDataParams = {
	token: string
	email: string
	visitorData: VisitorDataSchema
}

export async function updateVisitorData({ token, email, visitorData }: UpdateVisitorDataParams) {
	try {
		const db = await getDemoDb()

		const talkRes = await db.query<{
			id: string
			isActive: boolean
			expiresAt: string | null
			companyId: string
			companyEmails: string[] | null
		}>(
			`SELECT vt.id, vt."isActive", vt."expiresAt", vt."companyId", ec.emails AS "companyEmails"
			 FROM "visitor_talk" vt
			 LEFT JOIN "external_company" ec ON ec.id = vt."companyId"
			 WHERE vt."uniqueToken" = $1
			 LIMIT 1`,
			[token],
		)
		const visitorTalk = talkRes.rows[0]
		if (!visitorTalk) {
			return { ok: false, message: "Token de charla no válido", data: null }
		}
		if (!visitorTalk.isActive) {
			return { ok: false, message: "La charla ya no está activa", data: null }
		}
		if (visitorTalk.expiresAt && new Date(visitorTalk.expiresAt) < new Date()) {
			return { ok: false, message: "La charla ha expirado", data: null }
		}
		if (!visitorTalk.companyEmails?.includes(email)) {
			return { ok: false, message: "Email no autorizado para esta empresa", data: null }
		}

		const visitorRes = await db.query<{ id: string }>(
			`SELECT id FROM "external_visitor"
			 WHERE email = $1 AND "companyId" = $2 LIMIT 1`,
			[email, visitorTalk.companyId],
		)
		const visitorId = visitorRes.rows[0]?.id
		if (!visitorId) {
			return { ok: false, message: "Visitante no encontrado", data: null }
		}

		const now = new Date().toISOString()
		const updateRes = await db.query<{
			id: string
			email: string
			name: string
			rut: string
		}>(
			`UPDATE "external_visitor"
			 SET name = $1, rut = $2, "updatedAt" = $3
			 WHERE id = $4
			 RETURNING id, email, name, rut`,
			[visitorData.name, visitorData.rut, now, visitorId],
		)
		const visitor = updateRes.rows[0]

		const completionRes = await db.query<{ id: string }>(
			`INSERT INTO "visitor_talk_completion" (
				"id", "visitorId", "visitorTalkId", "status", "attemptNumber", "createdAt", "updatedAt"
			) VALUES ($1, $2, $3, 'NOT_STARTED', 1, $4, $4)
			 ON CONFLICT ("visitorId", "visitorTalkId") DO UPDATE
			   SET "updatedAt" = EXCLUDED."updatedAt"
			 RETURNING id`,
			[crypto.randomUUID(), visitor.id, visitorTalk.id, now],
		)
		const completion = completionRes.rows[0]

		await logActivity({
			userId: SYSTEM_USER_ID,
			module: MODULES.SAFETY_TALK,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: visitor.id,
			entityType: "ExternalVisitor",
			metadata: {
				visitorEmail: visitor.email,
				updatedFields: Object.keys(visitorData),
				name: visitor.name,
				rut: visitor.rut,
				companyId: visitorTalk.companyId,
				visitorTalkId: visitorTalk.id,
				completionId: completion.id,
				externalUpdate: true,
			},
		})

		return {
			ok: true,
			message: "Datos del visitante actualizados exitosamente",
			data: { visitor, completion, visitorTalk },
		}
	} catch (error) {
		console.error("[UPDATE_VISITOR_DATA]", error)
		return { ok: false, message: "Error interno del servidor", data: null }
	}
}
