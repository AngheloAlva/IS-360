import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import { reassignEquipmentLocationSchema } from "@/project/location/schemas/location.schema"
import type { ReassignEquipmentLocationInput } from "@/project/location/schemas/location.schema"

export async function reassignEquipmentLocation(
	input: ReassignEquipmentLocationInput,
) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	const parsed = reassignEquipmentLocationSchema.safeParse(input)
	if (!parsed.success) {
		return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos" }
	}

	const { equipmentId, locationId } = parsed.data

	try {
		const db = await getDemoDb()

		const locationResult = await db.query<{ id: string }>(
			`SELECT id FROM "Location" WHERE id = $1`,
			[locationId],
		)
		if (locationResult.rows.length === 0) {
			return { ok: false, message: "La ubicación no existe" }
		}

		const now = new Date().toISOString()
		const updateResult = await db.query<Record<string, unknown>>(
			`UPDATE "equipment"
			 SET "locationId" = $1, "updatedAt" = $2
			 WHERE id = $3
			 RETURNING *`,
			[locationId, now, equipmentId],
		)
		if (updateResult.rows.length === 0) {
			return { ok: false, message: "El equipo no existe" }
		}

		return { ok: true, data: updateResult.rows[0] }
	} catch (error) {
		console.error("[REASSIGN_EQUIPMENT_LOCATION]", error)
		return { ok: false, message: "Error al reasignar la ubicación del equipo" }
	}
}
