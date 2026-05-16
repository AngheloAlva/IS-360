import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

export async function getActiveWorkers() {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No se pudo obtener la sesión del usuario" }
	}

	try {
		const db = await getDemoDb()

		const permitsResult = await db.query<Record<string, unknown>>(
			`SELECT
				wp.*,
				u.id AS "user_id", u.name AS "user_name", u.email AS "user_email",
				wo."otNumber" AS "otNumber_otNumber"
			 FROM "work_permit" wp
			 JOIN "user" u ON u.id = wp."userId"
			 LEFT JOIN "work_order" wo ON wo.id = wp."otNumberId"
			 WHERE wp.status = 'ACTIVE'`,
		)

		const ids = permitsResult.rows.map((r) => r.id as string)
		const participantsResult = ids.length
			? await db.query<{ workPermitId: string; id: string; name: string }>(
					`SELECT wpp."B" AS "workPermitId", u.id, u.name
					 FROM "_WorkPermitParticipants" wpp
					 JOIN "user" u ON u.id = wpp."A"
					 WHERE wpp."B" = ANY($1::text[])`,
					[ids],
				)
			: { rows: [] }

		const participantsByPermit = new Map<string, { id: string; name: string }[]>()
		for (const p of participantsResult.rows) {
			const arr = participantsByPermit.get(p.workPermitId) ?? []
			arr.push({ id: p.id, name: p.name })
			participantsByPermit.set(p.workPermitId, arr)
		}

		const activeWorkers = permitsResult.rows.map((r) => ({
			...r,
			user: { id: r.user_id, name: r.user_name, email: r.user_email },
			otNumber: r.otNumber_otNumber ? { otNumber: r.otNumber_otNumber } : null,
			participants: participantsByPermit.get(r.id as string) ?? [],
		}))

		return { activeWorkers }
	} catch (error) {
		console.error("Error getting active workers:", error)
		return { error: "Error al obtener los trabajadores activos" }
	}
}
