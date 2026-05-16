import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import type { EquipmentSchema } from "@/project/equipment/schemas/equipment.schema"
import type { PGlite } from "@electric-sql/pglite"

interface UpdateEquipmentProps {
	id: string
	values: EquipmentSchema
}

export const updateEquipment = async ({ id, values }: UpdateEquipmentProps) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const { parentId, files = [], locationId, ...rest } = values

		const locationResult = await db.query<{ id: string }>(
			`SELECT id FROM "Location" WHERE id = $1`,
			[locationId],
		)
		if (locationResult.rows.length === 0) {
			return { ok: false, message: "La ubicación no existe" }
		}

		if (parentId) {
			if (parentId === id) {
				return { ok: false, message: "Un equipo no puede ser su propio padre" }
			}
			const descendants = await getDescendantIds(db, id)
			if (descendants.includes(parentId)) {
				return {
					ok: false,
					message: "No se puede asignar como padre a un equipo que ya es descendiente",
				}
			}
		}

		const currentAttachmentsResult = await db.query<{
			id: string
			url: string
		}>(`SELECT id, url FROM "attachment" WHERE "equipmentId" = $1`, [id])
		const currentAttachments = currentAttachmentsResult.rows

		const existingFileUrls = files
			.filter((file) => !file.file)
			.map((file) => file.url)

		const attachmentsToDelete = currentAttachments
			.filter((a) => !existingFileUrls.includes(a.url))
			.map((a) => a.id)

		const newAttachments = files
			.filter((f) => !f.file && !currentAttachments.some((a) => a.url === f.url))
			.map((f) => ({
				url: f.url,
				name: f.title,
				type: f.type,
				size: f.fileSize,
			}))

		const now = new Date().toISOString()

		await db.query(
			`UPDATE "equipment" SET
				name = $1,
				description = $2,
				"isOperational" = $3,
				type = $4,
				tag = $5,
				criticality = $6,
				"locationId" = $7,
				"parentId" = $8,
				"updatedAt" = $9
			 WHERE id = $10`,
			[
				rest.name,
				rest.description ?? null,
				rest.isOperational ?? true,
				rest.type ?? null,
				rest.tag,
				rest.criticality ?? null,
				locationId,
				parentId ?? null,
				now,
				id,
			],
		)

		for (const a of newAttachments) {
			await db.query(
				`INSERT INTO "attachment" (id, name, url, type, size, "equipmentId", "createdAt", "updatedAt")
				 VALUES ($1, $2, $3, $4, $5, $6, $7, $7)`,
				[crypto.randomUUID(), a.name, a.url, a.type, a.size, id, now],
			)
		}

		if (attachmentsToDelete.length > 0) {
			await db.query(
				`DELETE FROM "attachment" WHERE id = ANY($1::text[])`,
				[attachmentsToDelete],
			)
		}

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.EQUIPMENT,
				action: ACTIVITY_TYPE.UPDATE,
				entityId: id,
				entityType: "Equipment",
				metadata: {
					name: rest.name,
					newParentId: parentId ?? null,
					attachmentsAdded: newAttachments.length,
					attachmentsRemoved: attachmentsToDelete.length,
				},
			})
		} catch {
			// audit best-effort
		}

		return { ok: true }
	} catch (error) {
		console.error("[UPDATE_EQUIPMENT]", error)
		return { ok: false, message: "Error al actualizar el equipo" }
	}
}

async function getDescendantIds(db: PGlite, equipmentId: string): Promise<string[]> {
	const result = await db.query<{ id: string }>(
		`WITH RECURSIVE descendants AS (
			SELECT id FROM "equipment" WHERE "parentId" = $1
			UNION ALL
			SELECT e.id FROM "equipment" e
			JOIN descendants d ON e."parentId" = d.id
		)
		SELECT id FROM descendants`,
		[equipmentId],
	)
	return result.rows.map((r) => r.id)
}
