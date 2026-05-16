import { changeSubfolderStatusSchema } from "../schemas/change-subfolder-status.schema"
import { ACCESS_ROLE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

export async function changeSubfolderStatus(
	formData: FormData | { [key: string]: string | FormDataEntryValue },
) {
	const user = getDemoUser()
	if (!user || user.accessRole !== ACCESS_ROLE.ADMIN) {
		throw new Error("No tienes permisos para realizar esta acción")
	}

	const rawFormData =
		formData instanceof FormData ? Object.fromEntries(formData.entries()) : formData

	const validatedData = changeSubfolderStatusSchema.safeParse(rawFormData)
	if (!validatedData.success) {
		throw new Error("Datos inválidos")
	}

	const { startupFolderId, subfolderType, newStatus, entityId, reason } = validatedData.data

	try {
		const db = await getDemoDb()
		const now = new Date().toISOString()

		const updateByStartup = async (table: string) => {
			await db.query(
				`UPDATE "${table}" SET status = $1, "updatedAt" = $2 WHERE "startupFolderId" = $3`,
				[newStatus, now, startupFolderId],
			)
		}
		const updateByCompound = async (table: string, field: "workerId" | "vehicleId", id: string) => {
			await db.query(
				`UPDATE "${table}" SET status = $1, "updatedAt" = $2 WHERE "${field}" = $3 AND "startupFolderId" = $4`,
				[newStatus, now, id, startupFolderId],
			)
		}

		switch (subfolderType) {
			case "SAFETY_AND_HEALTH":
				await updateByStartup("safety_and_health_folder")
				break
			case "ENVIRONMENTAL":
				await updateByStartup("environmental_folder")
				break
			case "ENVIRONMENT":
				await updateByStartup("environment_folder")
				break
			case "TECHNICAL_SPECS":
				await updateByStartup("tech_specs_folder")
				break
			case "WORKER":
				if (!entityId) throw new Error("ID del trabajador requerido")
				await updateByCompound("worker_folders", "workerId", entityId)
				break
			case "VEHICLE":
				if (!entityId) throw new Error("ID del vehículo requerido")
				await updateByCompound("vehicle_folders", "vehicleId", entityId)
				break
			case "BASIC":
				if (!entityId) throw new Error("ID del trabajador requerido")
				await updateByCompound("basic_folder", "workerId", entityId)
				break
			default:
				throw new Error("Tipo de subcarpeta no válido")
		}

		const sfRes = await db.query<{ id: string; companyName: string }>(
			`SELECT sf.id, c.name AS "companyName"
			 FROM "startup_folder" sf JOIN "company" c ON c.id = sf."companyId"
			 WHERE sf.id = $1 LIMIT 1`,
			[startupFolderId],
		)
		const startupFolder = sfRes.rows[0]

		if (startupFolder) {
			try {
				await logActivity({
					action: "UPDATE",
					module: MODULES.STARTUP_FOLDERS,
					userId: user.id,
					entityType: "Subfolder",
					entityId: startupFolder.id,
					metadata: {
						startupFolderId,
						subfolderType,
						newStatus,
						entityId,
						reason,
						companyName: startupFolder.companyName,
					},
				})
			} catch {
				// audit best-effort
			}
		}

		return { ok: true, message: "Estado actualizado exitosamente" }
	} catch (error) {
		console.error("Error changing subfolder status:", error)
		throw new Error("Error al actualizar el estado de la subcarpeta")
	}
}
