import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import type { EquipmentSchema } from "@/project/equipment/schemas/equipment.schema"
import type { UploadResult } from "@/lib/upload-files"

interface CreateEquipmentProps {
	values: EquipmentSchema
	uploadResults: UploadResult[]
}

export const createEquipment = async ({ values, uploadResults }: CreateEquipmentProps) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const { parentId, files: _files, locationId, ...rest } = values

		const locationResult = await db.query<{ id: string }>(
			`SELECT id FROM "Location" WHERE id = $1`,
			[locationId],
		)
		if (locationResult.rows.length === 0) {
			return { ok: false, message: "La ubicación no existe" }
		}

		const id = crypto.randomUUID()
		const barcode = `${Date.now()}`
		const now = new Date().toISOString()

		await db.query(
			`INSERT INTO "equipment" (
				id, barcode, name, description, "isOperational", type, tag,
				criticality, "locationId", "parentId", "createdById",
				"createdAt", "updatedAt"
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12)`,
			[
				id,
				barcode,
				rest.name,
				rest.description ?? null,
				rest.isOperational ?? true,
				rest.type ?? null,
				rest.tag,
				rest.criticality ?? null,
				locationId,
				parentId ?? null,
				user.id,
				now,
			],
		)

		for (const r of uploadResults) {
			await db.query(
				`INSERT INTO "attachment" (id, name, url, type, size, "equipmentId", "createdAt", "updatedAt")
				 VALUES ($1, $2, $3, $4, $5, $6, $7, $7)`,
				[crypto.randomUUID(), r.name, r.url, r.type, r.size, id, now],
			)
		}

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.EQUIPMENT,
				action: ACTIVITY_TYPE.CREATE,
				entityId: id,
				entityType: "Equipment",
				metadata: {
					name: rest.name,
					barcode,
					createdBy: user.id,
					parentId: parentId ?? null,
					attachments: uploadResults.length,
				},
			})
		} catch {
			// audit best-effort
		}

		return { ok: true }
	} catch (error) {
		console.error("[CREATE_EQUIPMENT]", error)
		return { ok: false, message: "Error al crear el equipo" }
	}
}
