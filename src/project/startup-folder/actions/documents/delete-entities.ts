import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

interface DeleteFolderConfig {
	folderTable: string
	documentTable: string
	entityField: "workerId" | "vehicleId"
	entityLogType: string
	successMessage: string
	notFoundMessage: string
}

async function deleteFolderByEntity(
	config: DeleteFolderConfig,
	entityId: string,
	startupFolderId: string,
	userId: string,
) {
	const db = await getDemoDb()
	const folderRes = await db.query<{ id: string }>(
		`SELECT id FROM "${config.folderTable}"
		 WHERE "${config.entityField}" = $1 AND "startupFolderId" = $2 LIMIT 1`,
		[entityId, startupFolderId],
	)
	const folder = folderRes.rows[0]

	if (!folder) {
		return { ok: false as const, message: config.notFoundMessage }
	}

	await db.query(`DELETE FROM "${config.documentTable}" WHERE "folderId" = $1`, [folder.id])
	await db.query(`DELETE FROM "${config.folderTable}" WHERE id = $1`, [folder.id])

	try {
		await logActivity({
			userId,
			module: MODULES.STARTUP_FOLDERS,
			action: ACTIVITY_TYPE.DELETE,
			entityId: startupFolderId,
			entityType: config.entityLogType,
			metadata: { [config.entityField]: entityId, folderId: startupFolderId },
		})
	} catch {
		// audit best-effort
	}

	return { ok: true as const, message: config.successMessage }
}

export const deleteWorkerFolder = async ({
	folderId,
	workerId,
}: {
	folderId: string
	workerId: string
}) => {
	const user = getDemoUser()
	if (!user) return { ok: false, message: "No autorizado - Sesión no encontrada" }

	try {
		return await deleteFolderByEntity(
			{
				folderTable: "worker_folders",
				documentTable: "worker_document",
				entityField: "workerId",
				entityLogType: "WorkerFolder",
				successMessage: "Carpeta de personal eliminada correctamente",
				notFoundMessage: "Carpeta de personal no encontrada",
			},
			workerId,
			folderId,
			user.id,
		)
	} catch (error) {
		console.error("Error al eliminar la carpeta:", error)
		return { ok: false, message: "Error al procesar la solicitud" }
	}
}

export const deleteVehicleFolder = async ({
	folderId,
	vehicleId,
}: {
	folderId: string
	vehicleId: string
}) => {
	const user = getDemoUser()
	if (!user) return { ok: false, message: "No autorizado - Sesión no encontrada" }

	try {
		return await deleteFolderByEntity(
			{
				folderTable: "vehicle_folders",
				documentTable: "vehicle_document",
				entityField: "vehicleId",
				entityLogType: "VehicleFolder",
				successMessage: "Carpeta de vehiculo eliminada correctamente",
				notFoundMessage: "Carpeta de vehiculo no encontrada",
			},
			vehicleId,
			folderId,
			user.id,
		)
	} catch (error) {
		console.error("Error al eliminar la carpeta:", error)
		return { ok: false, message: "Error al procesar la solicitud" }
	}
}

export const deleteBasicFolder = async ({
	folderId,
	workerId,
}: {
	folderId: string
	workerId: string
}) => {
	const user = getDemoUser()
	if (!user) return { ok: false, message: "No autorizado - Sesión no encontrada" }

	try {
		return await deleteFolderByEntity(
			{
				folderTable: "basic_folder",
				documentTable: "basic_document",
				entityField: "workerId",
				entityLogType: "BasicFolder",
				successMessage: "Carpeta de personal eliminada correctamente",
				notFoundMessage: "Carpeta de personal no encontrada",
			},
			workerId,
			folderId,
			user.id,
		)
	} catch (error) {
		console.error("Error al eliminar la carpeta:", error)
		return { ok: false, message: "Error al procesar la solicitud" }
	}
}
