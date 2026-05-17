import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import type { FolderFormSchema } from "@/project/document/schemas/folder.schema"

interface UpdateFolderProps {
	id: string
	values: FolderFormSchema
}

export const updateFolder = async ({ id, values }: UpdateFolderProps) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const currentRes = await db.query<{
			id: string
			slug: string
			parentId: string | null
		}>(
			`SELECT id, slug, "parentId" FROM "folder" WHERE id = $1`,
			[id],
		)
		const current = currentRes.rows[0]
		if (!current) {
			return { ok: false, message: "Carpeta no encontrada" }
		}

		const { name, description, type, area } = values
		const now = new Date().toISOString()
		const updateRes = await db.query<Record<string, unknown>>(
			`UPDATE "folder"
			 SET name = $1, description = $2, type = $3, area = $4, "updatedAt" = $5
			 WHERE id = $6
			 RETURNING *`,
			[name, description ?? null, type ?? "default", area, now, id],
		)
		const updatedFolder = updateRes.rows[0]

		await logActivity({
			userId: user.id,
			module: MODULES.DOCUMENTATION,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: id,
			entityType: "Folder",
			metadata: {
				name,
				slug: current.slug,
				area,
				parentId: values.parentFolderId || current.parentId,
			},
		})

		return { ok: true, data: updatedFolder }
	} catch (error) {
		console.error("[UPDATE_FOLDER]", error)
		return { ok: false, message: "Error al actualizar la carpeta" }
	}
}
