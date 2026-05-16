import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import { createLocationSchema } from "@/project/location/schemas/location.schema"
import type { CreateLocationInput } from "@/project/location/schemas/location.schema"

export async function createLocation(input: CreateLocationInput) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	const parsed = createLocationSchema.safeParse(input)
	if (!parsed.success) {
		return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos" }
	}

	const { name, parentId } = parsed.data

	try {
		const db = await getDemoDb()

		let path: string
		if (parentId) {
			const parentResult = await db.query<{ path: string }>(
				`SELECT path FROM "Location" WHERE id = $1`,
				[parentId],
			)
			const parent = parentResult.rows[0]
			if (!parent) {
				return { ok: false, message: "La ubicación padre no existe" }
			}
			path = `${parent.path} / ${name}`
		} else {
			path = name
		}

		const siblingResult = await db.query<{ id: string }>(
			parentId
				? `SELECT id FROM "Location" WHERE "parentId" = $1 AND LOWER(name) = LOWER($2) LIMIT 1`
				: `SELECT id FROM "Location" WHERE "parentId" IS NULL AND LOWER(name) = LOWER($1) LIMIT 1`,
			parentId ? [parentId, name] : [name],
		)
		if (siblingResult.rows.length > 0) {
			return {
				ok: false,
				message: `Ya existe una ubicación con el nombre "${name}" en este nivel`,
			}
		}

		const id = crypto.randomUUID()
		const now = new Date().toISOString()

		await db.query(
			`INSERT INTO "Location" (id, name, "parentId", path, "createdAt", "updatedAt")
			 VALUES ($1, $2, $3, $4, $5, $5)`,
			[id, name, parentId ?? null, path, now],
		)

		return {
			ok: true,
			data: { id, name, parentId: parentId ?? null, path, createdAt: now, updatedAt: now },
		}
	} catch (error) {
		console.error("[CREATE_LOCATION]", error)
		return { ok: false, message: "Error al crear la ubicación" }
	}
}
