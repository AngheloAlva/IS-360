import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

interface UpdateStartupFolderProps {
	name: string
	startupFolderId: string
}

export const updateStartupFolder = async ({ name, startupFolderId }: UpdateStartupFolderProps) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const now = new Date().toISOString()
		const res = await db.query(
			`UPDATE "startup_folder" SET name = $1, "updatedAt" = $2 WHERE id = $3`,
			[name, now, startupFolderId],
		)

		if (res.affectedRows === 0) {
			return { ok: false, message: "Error al actualizar la carpeta de arranque" }
		}

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.STARTUP_FOLDERS,
				action: ACTIVITY_TYPE.UPDATE,
				entityId: startupFolderId,
				entityType: "StartupFolder",
				metadata: { name },
			})
		} catch {
			// audit best-effort
		}

		return {
			ok: true,
			message: "Carpeta de arranque actualizada correctamente",
			data: { folderId: startupFolderId },
		}
	} catch (error) {
		console.error("Error al actualizar la carpeta de arranque:", error)
		return { ok: false, message: "Error al actualizar la carpeta de arranque" }
	}
}
