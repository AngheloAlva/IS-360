import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import { updateLocationSchema } from "@/project/location/schemas/location.schema"
import type { UpdateLocationInput } from "@/project/location/schemas/location.schema"
import { recomputeSubtreePaths } from "@/project/location/actions/_helpers/recompute-subtree-paths"

export async function updateLocation(input: UpdateLocationInput) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	const parsed = updateLocationSchema.safeParse(input)
	if (!parsed.success) {
		return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos" }
	}

	const { id, name, parentId } = parsed.data

	try {
		const db = await getDemoDb()

		const currentResult = await db.query<{
			id: string
			name: string
			parentId: string | null
			path: string
		}>(`SELECT id, name, "parentId", path FROM "Location" WHERE id = $1`, [id])
		const current = currentResult.rows[0]
		if (!current) {
			return { ok: false, message: "La ubicación no existe" }
		}

		const nameChanged = name !== undefined && name !== current.name
		const parentChanged = parentId !== undefined && parentId !== current.parentId
		const effectiveName = name ?? current.name
		const effectiveParentId = parentChanged ? parentId : current.parentId

		if (parentChanged && effectiveParentId !== null) {
			if (effectiveParentId === id) {
				return { ok: false, message: "Una ubicación no puede ser su propio padre" }
			}

			const cycleResult = await db.query<{ would_cycle: boolean }>(
				`WITH RECURSIVE ancestors AS (
					SELECT id, "parentId" FROM "Location" WHERE id = $1
					UNION ALL
					SELECT l.id, l."parentId" FROM "Location" l
					JOIN ancestors a ON l.id = a."parentId"
				)
				SELECT EXISTS (SELECT 1 FROM ancestors WHERE id = $2) AS would_cycle`,
				[effectiveParentId, id],
			)
			if (cycleResult.rows[0]?.would_cycle) {
				return {
					ok: false,
					message: "No se puede mover una ubicación dentro de sus propios descendientes",
				}
			}
		}

		if (nameChanged || parentChanged) {
			const siblingParentId = parentChanged ? effectiveParentId : current.parentId

			const siblingResult = await db.query<{ id: string }>(
				siblingParentId
					? `SELECT id FROM "Location" WHERE "parentId" = $1 AND LOWER(name) = LOWER($2) AND id <> $3 LIMIT 1`
					: `SELECT id FROM "Location" WHERE "parentId" IS NULL AND LOWER(name) = LOWER($1) AND id <> $2 LIMIT 1`,
				siblingParentId ? [siblingParentId, effectiveName, id] : [effectiveName, id],
			)
			if (siblingResult.rows.length > 0) {
				return {
					ok: false,
					message: `Ya existe una ubicación con el nombre "${effectiveName}" en este nivel`,
				}
			}

			const now = new Date().toISOString()
			const setParts: string[] = [`"updatedAt" = $1`]
			const params: unknown[] = [now]
			if (nameChanged) {
				params.push(effectiveName)
				setParts.push(`name = $${params.length}`)
			}
			if (parentChanged) {
				params.push(effectiveParentId)
				setParts.push(`"parentId" = $${params.length}`)
			}
			params.push(id)
			await db.query(
				`UPDATE "Location" SET ${setParts.join(", ")} WHERE id = $${params.length}`,
				params,
			)

			await recomputeSubtreePaths(db, id)
		}

		const updatedResult = await db.query<Record<string, unknown>>(
			`SELECT * FROM "Location" WHERE id = $1`,
			[id],
		)
		return { ok: true, data: updatedResult.rows[0] }
	} catch (error) {
		console.error("[UPDATE_LOCATION]", error)
		return { ok: false, message: "Error al actualizar la ubicación" }
	}
}
