import { updateWorkerFolderConfigSchema } from "../../schemas/update-worker-folder-config.schema"
import {
	BASE_WORKER_STRUCTURE,
	DRIVER_WORKER_STRUCTURE,
} from "@/lib/consts/worker-folder-structure"
import { DocumentCategory } from "@/generated/prisma/enums"
import { getDemoDb } from "@/lib/demo-db/client"
import { recomputeSubfolderStatus } from "../recompute-subfolder-status"

const DRIVER_ONLY_DOCUMENT_TYPES = DRIVER_WORKER_STRUCTURE.documents
	.filter((d) => !BASE_WORKER_STRUCTURE.documents.some((bd) => bd.type === d.type))
	.map((d) => d.type)

export async function updateWorkerFolderConfig(data: {
	startupFolderId: string
	workerId: string
	newStatus: string
	isDriver: boolean
	reason: string
	confirmDeleteDriverDocs?: boolean
}) {
	const validated = updateWorkerFolderConfigSchema.safeParse(data)
	if (!validated.success) {
		return { ok: false, message: "Datos inválidos" }
	}

	const { startupFolderId, workerId, newStatus, isDriver, confirmDeleteDriverDocs } =
		validated.data

	try {
		const db = await getDemoDb()
		const folderRes = await db.query<{ id: string; isDriver: boolean | null; status: string }>(
			`SELECT id, "isDriver", status FROM "worker_folders"
			 WHERE "workerId" = $1 AND "startupFolderId" = $2 LIMIT 1`,
			[workerId, startupFolderId],
		)
		const folder = folderRes.rows[0]
		if (!folder) {
			return { ok: false, message: "Carpeta de trabajador no encontrada" }
		}

		const currentIsDriver = folder.isDriver ?? true
		const isRemovingDriver = currentIsDriver && !isDriver
		const statusChanged = folder.status !== newStatus
		const driverChanged = currentIsDriver !== isDriver

		if (isRemovingDriver) {
			const driverDocsRes = await db.query<{ id: string; type: string }>(
				`SELECT d.id, d.type FROM "worker_document" d
				 WHERE d."folderId" = $1 AND d.type = ANY($2::text[])`,
				[folder.id, DRIVER_ONLY_DOCUMENT_TYPES],
			)

			if (driverDocsRes.rows.length > 0 && !confirmDeleteDriverDocs) {
				return {
					ok: false,
					requiresConfirmation: true,
					message: `Se eliminarán ${driverDocsRes.rows.length} documento(s) exclusivos de conductor`,
					documentsToDelete: driverDocsRes.rows.map((d) => d.type),
				}
			}

			if (driverDocsRes.rows.length > 0 && confirmDeleteDriverDocs) {
				await db.query(`DELETE FROM "worker_document" WHERE id = ANY($1::text[])`, [
					driverDocsRes.rows.map((d) => d.id),
				])
			}
		}

		if (statusChanged || driverChanged) {
			const setClauses: string[] = []
			const params: unknown[] = []
			let idx = 1
			if (statusChanged) {
				setClauses.push(`status = $${idx++}`)
				params.push(newStatus)
			}
			if (driverChanged) {
				setClauses.push(`"isDriver" = $${idx++}`)
				params.push(isDriver)
			}
			setClauses.push(`"updatedAt" = $${idx++}`)
			params.push(new Date().toISOString())
			params.push(folder.id)
			await db.query(
				`UPDATE "worker_folders" SET ${setClauses.join(", ")} WHERE id = $${idx}`,
				params,
			)
		}

		if (driverChanged) {
			await recomputeSubfolderStatus({
				category: DocumentCategory.PERSONNEL,
				workerId,
				startupFolderId,
			})
		}

		return { ok: true, message: "Configuración actualizada exitosamente" }
	} catch (error) {
		console.error("Error updating worker folder config:", error)
		return { ok: false, message: "Error al actualizar la configuración de la carpeta" }
	}
}
