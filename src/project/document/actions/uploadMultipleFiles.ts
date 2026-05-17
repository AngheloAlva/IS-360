import { ACTIVITY_TYPE, type AREAS, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import type { FileFormSchema } from "@/project/document/schemas/new-file.schema"

type FileUploadResult = {
	url: string
	size: number
	type: string
	name: string
}

interface UploadMultipleFilesProps {
	values: Omit<FileFormSchema, "files"> & { files: undefined }
	files: FileUploadResult[]
}

export async function uploadMultipleFiles({ values, files }: UploadMultipleFilesProps) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, error: "No autorizado" }
	}

	try {
		const {
			area,
			name,
			code,
			userId: _ignoredUserId,
			otherCode,
			description,
			expirationDate,
			parentFolderId,
			registrationDate,
		} = values
		void _ignoredUserId
		const db = await getDemoDb()

		let folderId: string | null = null
		if (parentFolderId) {
			const folderRes = await db.query<{ id: string }>(
				`SELECT id FROM "folder" WHERE id = $1`,
				[parentFolderId],
			)
			if (!folderRes.rows[0]) {
				return { ok: false, error: "Carpeta no encontrada" }
			}
			folderId = folderRes.rows[0].id
		}

		const now = new Date().toISOString()
		const results = []
		for (const file of files) {
			const id = crypto.randomUUID()
			const insertRes = await db.query<Record<string, unknown>>(
				`INSERT INTO "file" (
					"id", "code", "name", "description", "area", "type", "size", "url",
					"registrationDate", "expirationDate", "folderId", "userId",
					"createdAt", "updatedAt"
				) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13)
				 RETURNING *`,
				[
					id,
					code || otherCode || null,
					name || file.name,
					description ?? null,
					area as AREAS,
					file.type,
					file.size,
					file.url,
					registrationDate ?? now,
					expirationDate ?? null,
					folderId,
					user.id,
					now,
				],
			)
			const created = insertRes.rows[0]
			results.push(created)

			await logActivity({
				userId: user.id,
				module: MODULES.DOCUMENTATION,
				action: ACTIVITY_TYPE.CREATE,
				entityId: id,
				entityType: "File",
				metadata: {
					name: created.name,
					type: created.type,
					size: created.size,
					code: created.code,
					area: created.area,
					description: created.description,
					folderId: created.folderId,
					expirationDate: (created.expirationDate as string | null) ?? null,
					registrationDate: (created.registrationDate as string | null) ?? null,
				},
			})
		}

		return { ok: true, data: results }
	} catch (error: unknown) {
		console.error("[UPLOAD_MULTIPLE_FILES]", error)
		return {
			ok: false,
			error: error instanceof Error ? error.message : "Error interno del servidor",
		}
	}
}
