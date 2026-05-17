import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import type { UpdateFileSchema } from "@/project/document/schemas/update-file.schema"

interface UpdateFileParams extends Omit<UpdateFileSchema, "file"> {
	fileId: string
	url: string
	size: number
	type: string
	previousUrl: string
	previousName: string
}

export const updateFile = async ({
	url,
	size,
	type,
	name,
	fileId,
	userId: _ignoredUserId,
	description,
	previousUrl,
	previousName,
	expirationDate,
	registrationDate,
}: UpdateFileParams) => {
	void _ignoredUserId
	const user = getDemoUser()
	if (!user) {
		return { ok: false, error: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const currentRes = await db.query<{ userId: string }>(
			`SELECT "userId" FROM "file" WHERE id = $1`,
			[fileId],
		)
		const current = currentRes.rows[0]
		if (!current) {
			return { ok: false, error: "Archivo no encontrado" }
		}

		const now = new Date().toISOString()
		const updateRes = await db.query<Record<string, unknown>>(
			`UPDATE "file"
			 SET url = $1, size = $2, type = $3, name = $4, description = $5,
			     "expirationDate" = $6, "registrationDate" = $7,
			     "revisionCount" = "revisionCount" + 1, "updatedAt" = $8
			 WHERE id = $9
			 RETURNING *`,
			[
				url,
				size,
				type,
				name,
				description ?? null,
				expirationDate ?? null,
				registrationDate ?? null,
				now,
				fileId,
			],
		)
		const updatedFile = updateRes.rows[0]

		if (url !== previousUrl) {
			await db.query(
				`INSERT INTO "file_history" (
					"id", "fileId", "previousUrl", "previousName", "userId", "modifiedAt"
				) VALUES ($1, $2, $3, $4, $5, $6)`,
				[crypto.randomUUID(), fileId, previousUrl, previousName, user.id, now],
			)
		}

		await logActivity({
			userId: user.id,
			module: MODULES.DOCUMENTATION,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: fileId,
			entityType: "File",
			metadata: {
				name,
				type,
				size,
				description,
				expirationDate: expirationDate?.toISOString?.(),
				registrationDate: registrationDate?.toISOString?.(),
				urlChanged: url !== previousUrl,
			},
		})

		return { ok: true, data: updatedFile }
	} catch (error) {
		console.error("[UPDATE_FILE]", error)
		return { ok: false, error: "Error al actualizar el archivo" }
	}
}
