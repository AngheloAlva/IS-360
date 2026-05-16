import { ACTIVITY_TYPE, MODULES, StartupFolderStatus } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

interface CompleteFolderParams {
	startupFolderId: string
}

export const completeFolder = async ({ startupFolderId }: CompleteFolderParams) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado - Sesión no encontrada" }
	}

	try {
		const db = await getDemoDb()
		const now = new Date().toISOString()

		const updateRes = await db.query(
			`UPDATE "startup_folder" SET status = $1, "updatedAt" = $2 WHERE id = $3`,
			[StartupFolderStatus.COMPLETED, now, startupFolderId],
		)
		if (updateRes.affectedRows === 0) {
			return { ok: false, message: "Carpeta de arranque no encontrada" }
		}

		const folderRes = await db.query<{ id: string; name: string; companyName: string }>(
			`SELECT sf.id, sf.name, c.name AS "companyName"
			 FROM "startup_folder" sf
			 JOIN "company" c ON c.id = sf."companyId"
			 WHERE sf.id = $1 LIMIT 1`,
			[startupFolderId],
		)
		const startupFolder = folderRes.rows[0]
		if (!startupFolder) {
			return { ok: false, message: "Carpeta de arranque no encontrada" }
		}

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.STARTUP_FOLDERS,
				action: ACTIVITY_TYPE.COMPLETE,
				entityId: startupFolder.id,
				entityType: "StartupFolder",
				metadata: {
					name: startupFolder.name,
					companyName: startupFolder.companyName,
				},
			})
		} catch {
			// audit best-effort
		}

		return { ok: true, message: "Carpeta de arranque completada correctamente" }
	} catch (error) {
		console.error("Error al completar la carpeta de arranque:", error)
		return { ok: false, message: "Error al completar la carpeta de arranque" }
	}
}
