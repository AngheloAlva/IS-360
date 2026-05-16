import { ACTIVITY_TYPE, MODULES, StartupFolderType } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

interface CreateStartupFolderProps {
	name: string
	companyId: string
	type: StartupFolderType
	moreMonthDuration: boolean
}

export const createStartupFolder = async ({
	name,
	companyId,
	type,
	moreMonthDuration,
}: CreateStartupFolderProps) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const id = crypto.randomUUID()
		const now = new Date().toISOString()

		await db.query(
			`INSERT INTO "startup_folder" (id, name, type, "companyId", "moreMonthDuration", status, "isDeleted", "isArchived", "createdAt", "updatedAt")
			 VALUES ($1, $2, $3, $4, $5, 'PENDING', false, false, $6, $6)`,
			[id, name, type, companyId, moreMonthDuration, now],
		)

		if (type === StartupFolderType.FULL) {
			const sahId = crypto.randomUUID()
			const envId = crypto.randomUUID()
			const techId = crypto.randomUUID()
			await db.query(
				`INSERT INTO "safety_and_health_folder" (id, status, "additionalNotificationEmails", "startupFolderId", "createdAt", "updatedAt")
				 VALUES ($1, 'DRAFT', ARRAY[]::text[], $2, $3, $3)`,
				[sahId, id, now],
			)
			await db.query(
				`INSERT INTO "environment_folder" (id, status, "additionalNotificationEmails", "startupFolderId", "createdAt", "updatedAt")
				 VALUES ($1, 'DRAFT', ARRAY[]::text[], $2, $3, $3)`,
				[envId, id, now],
			)
			await db.query(
				`INSERT INTO "tech_specs_folder" (id, status, "additionalNotificationEmails", "startupFolderId", "createdAt", "updatedAt")
				 VALUES ($1, 'DRAFT', ARRAY[]::text[], $2, $3, $3)`,
				[techId, id, now],
			)
		}

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.STARTUP_FOLDERS,
				action: ACTIVITY_TYPE.CREATE,
				entityId: id,
				entityType: "StartupFolder",
				metadata: { name, type, companyId },
			})
		} catch {
			// audit best-effort
		}

		return {
			ok: true,
			message: "Carpeta de arranque creada correctamente",
			data: { folderId: id },
		}
	} catch (error) {
		console.error("Error al crear la carpeta de arranque:", error)
		return { ok: false, message: "Error al crear la carpeta de arranque" }
	}
}
