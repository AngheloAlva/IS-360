import { z } from "zod"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

const archiveStartupFolderSchema = z.object({
	startupFolderId: z.string().min(1),
	archive: z.boolean(),
})

interface ArchiveStartupFolderProps {
	startupFolderId: string
	archive: boolean
}

export const archiveStartupFolder = async ({
	startupFolderId,
	archive,
}: ArchiveStartupFolderProps) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const validatedData = archiveStartupFolderSchema.parse({ startupFolderId, archive })
		const db = await getDemoDb()

		const res = await db.query<{
			id: string
			name: string
			type: string
			companyId: string
			isDeleted: boolean
			isArchived: boolean
		}>(
			`SELECT id, name, type, "companyId", "isDeleted", "isArchived"
			 FROM "startup_folder" WHERE id = $1 LIMIT 1`,
			[validatedData.startupFolderId],
		)
		const startupFolder = res.rows[0]

		if (!startupFolder) {
			return { ok: false, message: "Carpeta de arranque no encontrada" }
		}

		if (startupFolder.isDeleted) {
			return { ok: false, message: "No se puede archivar una carpeta eliminada" }
		}

		if (startupFolder.isArchived === validatedData.archive) {
			return {
				ok: false,
				message: validatedData.archive
					? "La carpeta ya está archivada"
					: "La carpeta no está archivada",
			}
		}

		const archivedAt = validatedData.archive ? new Date().toISOString() : null
		const now = new Date().toISOString()
		await db.query(
			`UPDATE "startup_folder" SET "isArchived" = $1, "archivedAt" = $2, "updatedAt" = $3 WHERE id = $4`,
			[validatedData.archive, archivedAt, now, startupFolder.id],
		)

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.STARTUP_FOLDERS,
				action: ACTIVITY_TYPE.UPDATE,
				entityId: startupFolder.id,
				entityType: "StartupFolder",
				metadata: {
					companyId: startupFolder.companyId,
					name: startupFolder.name,
					type: startupFolder.type,
					action: validatedData.archive ? "archived" : "unarchived",
				},
			})
		} catch {
			// audit best-effort
		}

		return {
			ok: true,
			message: validatedData.archive
				? "Carpeta de arranque archivada correctamente"
				: "Carpeta de arranque desarchivada correctamente",
			data: {
				folderId: startupFolder.id,
				isArchived: validatedData.archive,
			},
		}
	} catch (error) {
		console.error("Error al archivar la carpeta de arranque:", error)
		return { ok: false, message: "Error al archivar la carpeta de arranque" }
	}
}
