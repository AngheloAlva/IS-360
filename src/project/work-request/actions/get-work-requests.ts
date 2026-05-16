import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

type WorkRequestRow = Record<string, unknown>

async function loadWorkRequest(workRequest: WorkRequestRow) {
	const db = await getDemoDb()
	const id = workRequest.id as string
	const userId = workRequest.userId as string

	const userResult = await db.query<{
		name: string
		email: string
		image: string | null
		companyName: string | null
	}>(
		`SELECT u.name, u.email, u.image, c.name AS "companyName"
		 FROM "user" u
		 LEFT JOIN "company" c ON c.id = u."companyId"
		 WHERE u.id = $1`,
		[userId],
	)
	const u = userResult.rows[0]

	const attachmentsResult = await db.query<Record<string, unknown>>(
		`SELECT * FROM "attachment" WHERE "workRequestId" = $1`,
		[id],
	)

	const commentsResult = await db.query<Record<string, unknown>>(
		`SELECT c.*,
			u.name AS "user_name", u.email AS "user_email", u.image AS "user_image"
		 FROM "work_request_comment" c
		 LEFT JOIN "user" u ON u.id = c."userId"
		 WHERE c."workRequestId" = $1
		 ORDER BY c."createdAt" ASC`,
		[id],
	)

	return {
		...workRequest,
		user: u
			? {
					name: u.name,
					email: u.email,
					image: u.image,
					company: u.companyName ? { name: u.companyName } : null,
				}
			: null,
		attachments: attachmentsResult.rows,
		comments: commentsResult.rows.map((c) => ({
			...c,
			user: {
				name: c.user_name,
				email: c.user_email,
				image: c.user_image,
			},
		})),
	}
}

export async function getWorkRequests() {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No se pudo obtener la sesión del usuario" }
	}

	try {
		const db = await getDemoDb()
		const result = await db.query<WorkRequestRow>(
			`SELECT * FROM "work_request" ORDER BY "createdAt" DESC`,
		)
		return await Promise.all(result.rows.map(loadWorkRequest))
	} catch (error) {
		console.error("Error al obtener las solicitudes de trabajo:", error)
		throw new Error("Error al obtener las solicitudes de trabajo")
	}
}

export async function getWorkRequestById(id: string) {
	try {
		const db = await getDemoDb()
		const result = await db.query<WorkRequestRow>(
			`SELECT * FROM "work_request" WHERE id = $1`,
			[id],
		)
		const workRequest = result.rows[0]
		if (!workRequest) {
			throw new Error("Solicitud no encontrada")
		}
		return await loadWorkRequest(workRequest)
	} catch (error) {
		console.error("Error al obtener la solicitud de trabajo:", error)
		throw new Error("Error al obtener la solicitud de trabajo")
	}
}
