import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

export interface DeleteResponse {
	success: boolean
	message: string
	deletedFiles?: number
	deletedFolders?: number
}

async function getRecursiveFolderContents(folderId: string) {
	const db = await getDemoDb()
	const allFolderIds: string[] = []
	const queue: string[] = [folderId]
	while (queue.length) {
		const next = queue.shift()!
		allFolderIds.push(next)
		const subs = await db.query<{ id: string }>(
			`SELECT id FROM "folder" WHERE "parentId" = $1`,
			[next],
		)
		queue.push(...subs.rows.map((r) => r.id))
	}

	if (!allFolderIds.length) {
		return { fileIds: [] as string[], folderIds: [] as string[] }
	}
	const placeholders = allFolderIds.map((_, i) => `$${i + 1}`).join(", ")
	const filesRes = await db.query<{ id: string }>(
		`SELECT id FROM "file" WHERE "folderId" IN (${placeholders})`,
		allFolderIds,
	)
	return {
		fileIds: filesRes.rows.map((r) => r.id),
		folderIds: allFolderIds,
	}
}

export async function deleteFile(fileId: string): Promise<DeleteResponse> {
	const user = getDemoUser()
	if (!user) {
		return { success: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const fileRes = await db.query<{
			id: string
			name: string
			type: string
			size: number
			folderId: string | null
		}>(
			`SELECT id, name, type, size, "folderId" FROM "file" WHERE id = $1`,
			[fileId],
		)
		const file = fileRes.rows[0]
		if (!file) return { success: false, message: "Archivo no encontrado" }

		const now = new Date().toISOString()
		await db.query(
			`UPDATE "file" SET "isActive" = false, name = $1, "updatedAt" = $2 WHERE id = $3`,
			[`(Eliminado) ${file.name}`, now, fileId],
		)

		await logActivity({
			userId: user.id,
			module: MODULES.DOCUMENTATION,
			action: ACTIVITY_TYPE.DELETE,
			entityId: file.id,
			entityType: "File",
			metadata: {
				name: file.name,
				type: file.type,
				size: file.size,
				folderId: file.folderId,
			},
		})

		return {
			success: true,
			message: "Archivo marcado como eliminado exitosamente",
			deletedFiles: 1,
		}
	} catch (error) {
		console.error("[DELETE_FILE]", error)
		return { success: false, message: "Error al eliminar el archivo" }
	}
}

export async function deleteFolder(folderId: string): Promise<DeleteResponse> {
	const user = getDemoUser()
	if (!user) {
		return { success: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const folderRes = await db.query<{
			id: string
			name: string
			slug: string
			area: string
			parentId: string | null
		}>(
			`SELECT id, name, slug, area, "parentId" FROM "folder" WHERE id = $1`,
			[folderId],
		)
		const folder = folderRes.rows[0]
		if (!folder) return { success: false, message: "Carpeta no encontrada" }

		const { fileIds, folderIds } = await getRecursiveFolderContents(folderId)
		const now = new Date().toISOString()

		if (fileIds.length) {
			const fileNamesRes = await db.query<{ id: string; name: string }>(
				`SELECT id, name FROM "file"
				 WHERE id IN (${fileIds.map((_, i) => `$${i + 1}`).join(", ")})`,
				fileIds,
			)
			for (const f of fileNamesRes.rows) {
				await db.query(
					`UPDATE "file" SET "isActive" = false, name = $1, "updatedAt" = $2 WHERE id = $3`,
					[`(Eliminado) ${f.name}`, now, f.id],
				)
			}
		}

		if (folderIds.length) {
			const placeholders = folderIds.map((_, i) => `$${i + 3}`).join(", ")
			await db.query(
				`UPDATE "folder"
				 SET "isActive" = false,
				     slug = 'eliminado-' || slug,
				     name = '(Eliminado) ' || name,
				     "updatedAt" = $1
				 WHERE id IN (${placeholders}) AND $2::boolean`,
				[now, true, ...folderIds],
			)
		}

		await logActivity({
			userId: user.id,
			module: MODULES.DOCUMENTATION,
			action: ACTIVITY_TYPE.DELETE,
			entityId: folder.id,
			entityType: "Folder",
			metadata: {
				name: folder.name,
				slug: folder.slug,
				area: folder.area,
				parentId: folder.parentId,
				affectedFiles: fileIds.length,
				affectedFolders: Math.max(0, folderIds.length - 1),
			},
		})

		return {
			success: true,
			message: "Carpeta y contenido marcados como eliminados exitosamente",
			deletedFiles: fileIds.length,
			deletedFolders: folderIds.length,
		}
	} catch (error) {
		console.error("[DELETE_FOLDER]", error)
		return { success: false, message: "Error al eliminar la carpeta" }
	}
}

export async function getDeletePreview(
	id: string,
	type: "file" | "folder",
): Promise<{
	files: Array<{ id: string; name: string }>
	folders: Array<{ id: string; name: string }>
}> {
	const db = await getDemoDb()
	if (type === "file") {
		const res = await db.query<{ id: string; name: string }>(
			`SELECT id, name FROM "file" WHERE id = $1`,
			[id],
		)
		return { files: res.rows, folders: [] }
	}

	const { fileIds, folderIds } = await getRecursiveFolderContents(id)
	const files = fileIds.length
		? (
				await db.query<{ id: string; name: string }>(
					`SELECT id, name FROM "file" WHERE id IN (${fileIds.map((_, i) => `$${i + 1}`).join(", ")})`,
					fileIds,
				)
			).rows
		: []
	const folders = folderIds.length
		? (
				await db.query<{ id: string; name: string }>(
					`SELECT id, name FROM "folder" WHERE id IN (${folderIds.map((_, i) => `$${i + 1}`).join(", ")})`,
					folderIds,
				)
			).rows
		: []
	return { files, folders }
}
