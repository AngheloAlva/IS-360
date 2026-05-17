import { randomBytes } from "crypto"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"
import { sendVisitorTalkInviteEmail } from "@/project/safety-talk/actions/sendVisitorTalkInviteEmail"

import type { ExternalCompanySchema } from "@/project/safety-talk/schemas/external-company.schema"

type CreateExternalCompanyParams = {
	values: ExternalCompanySchema
	videoUrl: string
	expiresAt?: Date
}

export async function createExternalCompany({
	values,
	videoUrl,
	expiresAt,
}: CreateExternalCompanyParams) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const now = new Date().toISOString()
		const uniqueToken = randomBytes(16).toString("hex")

		const existingRes = await db.query<{ id: string; emails: string[] | null }>(
			`SELECT id, emails FROM "external_company" WHERE rut = $1 LIMIT 1`,
			[values.rut],
		)
		const existing = existingRes.rows[0]

		let companyId: string
		const newEmails = values.emails.map((item) => item.email)
		const mergedEmails = existing
			? [...new Set([...(existing.emails ?? []), ...newEmails])]
			: newEmails

		if (existing) {
			companyId = existing.id
			await db.query(
				`UPDATE "external_company" SET name = $1, emails = $2 WHERE id = $3`,
				[values.name, mergedEmails, companyId],
			)
		} else {
			companyId = crypto.randomUUID()
			await db.query(
				`INSERT INTO "external_company" ("id", "name", "rut", "emails", "createdAt")
				 VALUES ($1, $2, $3, $4, $5)`,
				[companyId, values.name, values.rut, newEmails, now],
			)
		}

		const visitorTalkId = crypto.randomUUID()
		await db.query(
			`INSERT INTO "visitor_talk" (
				"id", "videoUrl", "expiresAt", "uniqueToken", "companyId", "category",
				"isActive", "createdAt", "updatedAt"
			) VALUES ($1, $2, $3, $4, $5, $6, true, $7, $7)`,
			[
				visitorTalkId,
				videoUrl,
				expiresAt?.toISOString() ?? null,
				uniqueToken,
				companyId,
				values.category,
				now,
			],
		)

		const visitors: Array<{ id: string; email: string }> = []
		for (const item of values.emails) {
			const existingVisitor = await db.query<{ id: string }>(
				`SELECT id FROM "external_visitor"
				 WHERE email = $1 AND "companyId" = $2 LIMIT 1`,
				[item.email, companyId],
			)
			if (existingVisitor.rows[0]) {
				visitors.push({ id: existingVisitor.rows[0].id, email: item.email })
			} else {
				const visitorId = crypto.randomUUID()
				await db.query(
					`INSERT INTO "external_visitor" (
						"id", "rut", "name", "email", "companyId", "createdAt", "updatedAt"
					) VALUES ($1, '', '', $2, $3, $4, $4)`,
					[visitorId, item.email, companyId, now],
				)
				visitors.push({ id: visitorId, email: item.email })
			}
		}

		const emailResults = await Promise.allSettled(
			values.emails.map(async (item) => {
				await sendVisitorTalkInviteEmail({
					companyName: values.name,
					visitorEmail: item.email,
					accessToken: uniqueToken,
					expiresAt: expiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
				})
				return { email: item.email, sent: true }
			}),
		)
		const successfulEmails = emailResults.filter(
			(r) => r.status === "fulfilled" && r.value.sent,
		).length

		const message = existing
			? `Charla de visitantes creada exitosamente. Se agregaron nuevos emails a la empresa existente. Invitaciones enviadas: ${successfulEmails}/${values.emails.length}`
			: `Empresa externa y charla de visitantes creada exitosamente. Invitaciones enviadas: ${successfulEmails}/${values.emails.length}`

		await logActivity({
			userId: user.id,
			entityId: companyId,
			module: MODULES.SAFETY_TALK,
			action: ACTIVITY_TYPE.CREATE,
			entityType: "ExternalCompany",
			metadata: { name: values.name, rut: values.rut, emails: mergedEmails },
		})

		return {
			ok: true,
			message,
			data: {
				company: { id: companyId, name: values.name, rut: values.rut, emails: mergedEmails },
				visitorTalk: { id: visitorTalkId, uniqueToken, expiresAt: expiresAt ?? null },
				visitors,
				isExistingCompany: !!existing,
				emailsSent: successfulEmails,
				totalEmails: values.emails.length,
			},
		}
	} catch (error) {
		console.error("[CREATE_EXTERNAL_COMPANY]", error)
		return { ok: false, message: "Error interno del servidor", data: null }
	}
}
