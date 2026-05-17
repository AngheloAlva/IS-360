import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { generateSlug } from "@/lib/generateSlug"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import type { FolderFormSchema } from "@/project/document/schemas/folder.schema"

export const createFolder = async (values: FolderFormSchema) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const { parentFolderId, userId: _ignoredUserId, ...rest } = values
		void _ignoredUserId
		const db = await getDemoDb()
		const slug = generateSlug(rest.name)

		const existing = await db.query<{ id: string }>(
			`SELECT id FROM "folder"
			 WHERE area = $1 AND slug = $2 AND ${parentFolderId ? `"parentId" = $3` : `"parentId" IS NULL`}
			 LIMIT 1`,
			parentFolderId ? [rest.area, slug, parentFolderId] : [rest.area, slug],
		)
		if (existing.rows.length) {
			return {
				ok: false,
				message:
					"Ya existe una carpeta con este nombre en este nivel. Intenta con otro nombre por favor",
			}
		}

		const id = crypto.randomUUID()
		const now = new Date().toISOString()
		const folderRes = await db.query<Record<string, unknown>>(
			`INSERT INTO "folder" (
				"id", "slug", "name", "description", "area", "type",
				"parentId", "userId", "createdAt", "updatedAt"
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
			 RETURNING *`,
			[
				id,
				slug,
				rest.name,
				rest.description ?? null,
				rest.area,
				rest.type ?? "default",
				parentFolderId ?? null,
				user.id,
				now,
			],
		)
		const folder = folderRes.rows[0]

		await logActivity({
			userId: user.id,
			module: MODULES.DOCUMENTATION,
			action: ACTIVITY_TYPE.CREATE,
			entityId: id,
			entityType: "Folder",
			metadata: {
				name: rest.name,
				slug,
				area: rest.area,
				parentId: parentFolderId ?? null,
			},
		})

		return { ok: true, data: folder }
	} catch (error) {
		console.error("[CREATE_FOLDER]", error)
		return { ok: false, message: "Error creating folder" }
	}
}
