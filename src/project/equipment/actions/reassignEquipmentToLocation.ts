import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

interface ReassignEquipmentToLocationInput {
	id: string
	locationId: string
	clearParent: boolean
}

export async function reassignEquipmentToLocation({
	id,
	locationId,
	clearParent,
}: ReassignEquipmentToLocationInput) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()

		const locationResult = await db.query<{ id: string }>(
			`SELECT id FROM "Location" WHERE id = $1`,
			[locationId],
		)
		if (locationResult.rows.length === 0) {
			return { ok: false, message: "La ubicación no existe" }
		}

		const equipmentResult = await db.query<{ id: string }>(
			`SELECT id FROM "equipment" WHERE id = $1`,
			[id],
		)
		if (equipmentResult.rows.length === 0) {
			return { ok: false, message: "El equipo no existe" }
		}

		const now = new Date().toISOString()
		const updateResult = await db.query<Record<string, unknown>>(
			clearParent
				? `UPDATE "equipment" SET "locationId" = $1, "parentId" = NULL, "updatedAt" = $2 WHERE id = $3 RETURNING *`
				: `UPDATE "equipment" SET "locationId" = $1, "updatedAt" = $2 WHERE id = $3 RETURNING *`,
			[locationId, now, id],
		)

		return { ok: true, data: updateResult.rows[0] }
	} catch (error) {
		console.error("[REASSIGN_EQUIPMENT_TO_LOCATION]", error)
		return { ok: false, message: "Error al reasignar el equipo" }
	}
}
