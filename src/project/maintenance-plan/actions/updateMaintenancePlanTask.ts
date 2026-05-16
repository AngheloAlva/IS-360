import { type MaintenancePlanTaskSchema } from "../schemas/maintenance-plan-task.schema"
import { type UploadResult } from "@/lib/upload-files"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

interface UpdateMaintenancePlanTaskProps {
	values: MaintenancePlanTaskSchema
	attachments?: UploadResult[]
	taskId: string
}

const getNormalizedEquipmentIds = (
	values: MaintenancePlanTaskSchema,
	currentEquipmentId: string | null,
): string[] => {
	const ids = values.equipmentIds?.length
		? values.equipmentIds
		: values.equipmentId
			? [values.equipmentId]
			: currentEquipmentId
				? [currentEquipmentId]
				: []
	return [...new Set(ids)].filter(Boolean)
}

export async function updateMaintenancePlanTask({
	values,
	attachments = [],
	taskId,
}: UpdateMaintenancePlanTaskProps) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()

		const existingResult = await db.query<{ equipmentId: string | null }>(
			`SELECT "equipmentId" FROM "maintenance_plan_task" WHERE id = $1`,
			[taskId],
		)
		const existing = existingResult.rows[0]
		if (!existing) {
			return { ok: false, message: "Tarea no encontrada" }
		}

		const equipmentIds = getNormalizedEquipmentIds(values, existing.equipmentId)
		const now = new Date().toISOString()
		const nextDate = new Date(values.nextDate)

		await db.query(
			`UPDATE "maintenance_plan_task" SET
				name = $1, description = $2, frequency = $3, "nextDate" = $4,
				"originalDayOfMonth" = $5, specialty = $6, "taskType" = $7,
				"isAutomated" = $8, "emailsForCopy" = $9,
				"automatedCompanyId" = $10, "automatedResponsibleId" = $11,
				"automatedSupervisorId" = $12, "automatedWorkOrderType" = $13,
				"automatedPriority" = $14, "automatedCapex" = $15,
				"automatedEstimatedDays" = $16, "automatedEstimatedDaysByMonth" = $17,
				"automatedEstimatedHours" = $18, "automatedDaysInAdvance" = $19,
				"automatedWorkDescription" = $20, "blockIfPreviousNotCompleted" = $21,
				${equipmentIds.length > 0 ? `"equipmentId" = $22,` : ""}
				"updatedAt" = $${equipmentIds.length > 0 ? 23 : 22}
			 WHERE id = $${equipmentIds.length > 0 ? 24 : 23}`,
			[
				values.name,
				values.description ?? null,
				values.frequency,
				nextDate.toISOString(),
				nextDate.getDate(),
				values.specialty ?? null,
				values.taskType ?? null,
				values.isAutomated ?? false,
				values.emailsForCopy ?? [],
				values.automatedCompanyId || null,
				values.automatedResponsibleId,
				values.automatedSupervisorId || null,
				values.automatedWorkOrderType || null,
				values.automatedPriority || null,
				values.automatedCapex || null,
				values.automatedEstimatedDays ? +values.automatedEstimatedDays : null,
				values.automatedEstimatedDaysByMonth ?? false,
				values.automatedEstimatedHours ? +values.automatedEstimatedHours : null,
				values.automatedDaysInAdvance ? +values.automatedDaysInAdvance : null,
				values.automatedWorkDescription || null,
				values.blockIfPreviousNotCompleted ?? true,
				...(equipmentIds.length > 0 ? [equipmentIds[0]] : []),
				now,
				taskId,
			],
		)

		if (equipmentIds.length > 0) {
			await db.query(
				`DELETE FROM "_MaintenancePlanTaskEquipments" WHERE "B" = $1`,
				[taskId],
			)
			for (const eqId of equipmentIds) {
				await db.query(
					`INSERT INTO "_MaintenancePlanTaskEquipments" ("A", "B") VALUES ($1, $2)
					 ON CONFLICT DO NOTHING`,
					[eqId, taskId],
				)
			}
		}

		for (const a of attachments) {
			await db.query(
				`INSERT INTO "attachment" (id, name, url, type, "maintenancePlanTaskId", "createdAt", "updatedAt")
				 VALUES ($1, $2, $3, $4, $5, $6, $6)`,
				[crypto.randomUUID(), values.name, a.url, a.type, taskId, now],
			)
		}

		return { ok: true, message: "Tarea actualizada exitosamente" }
	} catch (error) {
		console.error("[UPDATE_MAINTENANCE_PLAN_TASK]", error)
		return { ok: false, message: "Error al actualizar la tarea" }
	}
}
