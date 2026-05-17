import { http, HttpResponse } from "msw"

import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

const TICKET_BASE_COLUMNS = `
	st.*,
	u.id AS "u_id", u.name AS "u_name", u.email AS "u_email", u.image AS "u_image",
	c.id AS "c_id", c.name AS "c_name"
`

const TICKET_BASE_JOINS = `
	LEFT JOIN "user" u ON u.id = st."requesterId"
	LEFT JOIN "company" c ON c.id = u."companyId"
`

interface TicketRow extends Record<string, unknown> {
	id: string
	u_id: string | null
	u_name: string | null
	u_email: string | null
	u_image: string | null
	c_id: string | null
	c_name: string | null
}

function buildRequester(row: TicketRow) {
	if (!row.u_id) return null
	return {
		id: row.u_id,
		name: row.u_name,
		email: row.u_email,
		image: row.u_image,
		company: row.c_id ? { id: row.c_id, name: row.c_name } : null,
	}
}

async function loadAttachments(ticketIds: string[], opts: { onlyOnTicket?: boolean } = {}) {
	if (!ticketIds.length) return new Map<string, unknown[]>()
	const db = await getDemoDb()
	const placeholders = ticketIds.map((_, i) => `$${i + 1}`).join(", ")
	const whereNote = opts.onlyOnTicket ? `AND "supportTicketNoteId" IS NULL` : ""
	const result = await db.query<{
		supportTicketId: string
		supportTicketNoteId: string | null
		[k: string]: unknown
	}>(
		`SELECT * FROM "support_ticket_attachment"
		 WHERE "supportTicketId" IN (${placeholders}) ${whereNote}
		 ORDER BY "createdAt" ASC`,
		ticketIds,
	)
	const map = new Map<string, unknown[]>()
	for (const att of result.rows) {
		const list = map.get(att.supportTicketId) ?? []
		list.push(att)
		map.set(att.supportTicketId, list)
	}
	return map
}

async function loadNotes(ticketIds: string[], includeAttachments = false) {
	if (!ticketIds.length) return new Map<string, unknown[]>()
	const db = await getDemoDb()
	const placeholders = ticketIds.map((_, i) => `$${i + 1}`).join(", ")
	const notes = await db.query<{
		id: string
		supportTicketId: string
		userId: string
		content: string
		createdAt: string
		updatedAt: string
		u_id: string | null
		u_name: string | null
		u_email: string | null
		u_image: string | null
	}>(
		`SELECT n.*, u.id AS "u_id", u.name AS "u_name", u.email AS "u_email", u.image AS "u_image"
		 FROM "support_ticket_note" n
		 LEFT JOIN "user" u ON u.id = n."userId"
		 WHERE n."supportTicketId" IN (${placeholders})
		 ORDER BY n."createdAt" ASC`,
		ticketIds,
	)

	let attsByNote = new Map<string, unknown[]>()
	if (includeAttachments && notes.rows.length) {
		const noteIds = notes.rows.map((n) => n.id)
		const noteIdPlaceholders = noteIds.map((_, i) => `$${i + 1}`).join(", ")
		const attRes = await db.query<{ supportTicketNoteId: string; [k: string]: unknown }>(
			`SELECT * FROM "support_ticket_attachment"
			 WHERE "supportTicketNoteId" IN (${noteIdPlaceholders})
			 ORDER BY "createdAt" ASC`,
			noteIds,
		)
		for (const att of attRes.rows) {
			if (!att.supportTicketNoteId) continue
			const list = attsByNote.get(att.supportTicketNoteId) ?? []
			list.push(att)
			attsByNote.set(att.supportTicketNoteId, list)
		}
	}

	const map = new Map<string, unknown[]>()
	for (const note of notes.rows) {
		const enriched = {
			...note,
			user: note.u_id
				? { id: note.u_id, name: note.u_name, email: note.u_email, image: note.u_image }
				: null,
			...(includeAttachments ? { attachments: attsByNote.get(note.id) ?? [] } : {}),
		}
		const list = map.get(note.supportTicketId) ?? []
		list.push(enriched)
		map.set(note.supportTicketId, list)
	}
	return map
}

const detailHandler = http.get("*/api/support/:id", async ({ params }) => {
	const user = getDemoUser()
	if (!user) return new HttpResponse("No autorizado", { status: 401 })

	const db = await getDemoDb()
	const id = params.id as string
	const result = await db.query<TicketRow>(
		`SELECT ${TICKET_BASE_COLUMNS}
		 FROM "support_ticket" st
		 ${TICKET_BASE_JOINS}
		 WHERE st.id = $1`,
		[id],
	)
	const row = result.rows[0]
	if (!row) {
		return HttpResponse.json({ error: "Ticket no encontrado" }, { status: 404 })
	}

	const isAdmin = user.accessRole === "ADMIN"
	if (!isAdmin && row.requesterId !== user.id) {
		return HttpResponse.json({ error: "No autorizado" }, { status: 403 })
	}

	const attsMap = await loadAttachments([id], { onlyOnTicket: true })
	const notesMap = await loadNotes([id], true)

	return HttpResponse.json({
		...row,
		requester: buildRequester(row),
		attachments: attsMap.get(id) ?? [],
		notes: notesMap.get(id) ?? [],
	})
})

const listHandler = http.get("*/api/support", async ({ request }) => {
	const user = getDemoUser()
	if (!user) return new HttpResponse("No autorizado", { status: 401 })

	const url = new URL(request.url)
	const page = parseInt(url.searchParams.get("page") || "1", 10)
	const limit = parseInt(url.searchParams.get("limit") || "10", 10)
	const search = url.searchParams.get("search") || ""
	const status = url.searchParams.get("status") || "all"
	const skip = (page - 1) * limit

	const db = await getDemoDb()
	const conditions: string[] = []
	const params: unknown[] = []

	if (search) {
		params.push(`%${search}%`)
		conditions.push(
			`(st."ticketNumber" ILIKE $${params.length} OR st.title ILIKE $${params.length} OR st.description ILIKE $${params.length})`,
		)
	}
	if (status !== "all") {
		params.push(status)
		conditions.push(`st.status = $${params.length}`)
	}
	const isAdmin = user.accessRole === "ADMIN"
	if (!isAdmin) {
		params.push(user.id)
		conditions.push(`st."requesterId" = $${params.length}`)
	}

	const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""

	const totalRes = await db.query<{ count: string }>(
		`SELECT COUNT(*)::text AS count FROM "support_ticket" st ${where}`,
		params,
	)
	const total = parseInt(totalRes.rows[0]?.count ?? "0", 10)

	const listRes = await db.query<TicketRow>(
		`SELECT ${TICKET_BASE_COLUMNS}
		 FROM "support_ticket" st
		 ${TICKET_BASE_JOINS}
		 ${where}
		 ORDER BY st."createdAt" DESC
		 LIMIT ${limit} OFFSET ${skip}`,
		params,
	)

	const ticketIds = listRes.rows.map((r) => r.id)
	const attsMap = await loadAttachments(ticketIds)
	const notesMap = await loadNotes(ticketIds)

	const tickets = listRes.rows.map((row) => ({
		...row,
		requester: buildRequester(row),
		attachments: attsMap.get(row.id) ?? [],
		notes: notesMap.get(row.id) ?? [],
	}))

	return HttpResponse.json({
		tickets,
		total,
		pages: Math.ceil(total / limit),
	})
})

// ORDER MATTERS: specific :id before list
export const supportHandlers = [detailHandler, listHandler]
