import { deleteStartupFolderSchema } from "../schemas/delete-startup-folder.schema"
import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoDb } from "@/lib/demo-db/client"

interface DeleteStartupFolderProps {
	startupFolderId: string
	userId: string
}

export const deleteStartupFolder = async ({
	startupFolderId,
	userId,
}: DeleteStartupFolderProps) => {
	try {
		const validatedData = deleteStartupFolderSchema.parse({ startupFolderId })
		const db = await getDemoDb()

		const res = await db.query<{
			id: string
			name: string
			type: string
			companyId: string
			isDeleted: boolean
		}>(
			`SELECT id, name, type, "companyId", "isDeleted" FROM "startup_folder" WHERE id = $1 LIMIT 1`,
			[validatedData.startupFolderId],
		)
		const startupFolder = res.rows[0]

		if (!startupFolder) {
			return { ok: false, message: "Carpeta de arranque no encontrada" }
		}

		if (startupFolder.isDeleted) {
			return { ok: false, message: "La carpeta de arranque ya está eliminada" }
		}

		const newName = `Eliminado - ${startupFolder.name}`
		const now = new Date().toISOString()
		await db.query(
			`UPDATE "startup_folder" SET "isDeleted" = true, name = $1, "updatedAt" = $2 WHERE id = $3`,
			[newName, now, startupFolder.id],
		)

		try {
			await logActivity({
				userId,
				module: MODULES.STARTUP_FOLDERS,
				action: ACTIVITY_TYPE.DELETE,
				entityId: startupFolder.id,
				entityType: "StartupFolder",
				metadata: {
					companyId: startupFolder.companyId,
					originalName: startupFolder.name,
					newName,
					type: startupFolder.type,
				},
			})
		} catch {
			// audit best-effort
		}

		return {
			ok: true,
			message: "Carpeta de arranque eliminada correctamente",
			data: { folderId: startupFolder.id },
		}
	} catch (error) {
		console.error("Error al eliminar la carpeta de arranque:", error)
		return { ok: false, message: "Error al eliminar la carpeta de arranque" }
	}
}
