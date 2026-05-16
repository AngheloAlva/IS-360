import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import { deleteLocationSchema } from "@/project/location/schemas/location.schema"
import type { DeleteLocationInput } from "@/project/location/schemas/location.schema"

export async function deleteLocation(input: DeleteLocationInput) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	const parsed = deleteLocationSchema.safeParse(input)
	if (!parsed.success) {
		return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos" }
	}

	const { id } = parsed.data

	try {
		const db = await getDemoDb()

		const locationResult = await db.query<{
			id: string
			name: string
			parentId: string | null
		}>(`SELECT id, name, "parentId" FROM "Location" WHERE id = $1`, [id])
		const location = locationResult.rows[0]
		if (!location) {
			return { ok: false, message: "La ubicación no existe" }
		}

		if (location.name === "Sin ubicación" && location.parentId === null) {
			return {
				ok: false,
				message: 'No se puede eliminar la ubicación sentinel "Sin ubicación"',
			}
		}

		const childrenResult = await db.query<{ count: number }>(
			`SELECT COUNT(*)::int AS count FROM "Location" WHERE "parentId" = $1`,
			[id],
		)
		const childrenCount = childrenResult.rows[0]?.count ?? 0
		if (childrenCount > 0) {
			return {
				ok: false,
				message: `No se puede eliminar: tiene ${childrenCount} ubicación${childrenCount === 1 ? "" : "es"} hija${childrenCount === 1 ? "" : "s"}`,
			}
		}

		const equipmentResult = await db.query<{ count: number }>(
			`SELECT COUNT(*)::int AS count FROM "equipment" WHERE "locationId" = $1`,
			[id],
		)
		const equipmentCount = equipmentResult.rows[0]?.count ?? 0
		if (equipmentCount > 0) {
			return {
				ok: false,
				message: `No se puede eliminar: tiene ${equipmentCount} equipo${equipmentCount === 1 ? "" : "s"} asignado${equipmentCount === 1 ? "" : "s"}`,
			}
		}

		await db.query(`DELETE FROM "Location" WHERE id = $1`, [id])

		return { ok: true }
	} catch (error) {
		console.error("[DELETE_LOCATION]", error)
		return { ok: false, message: "Error al eliminar la ubicación" }
	}
}
