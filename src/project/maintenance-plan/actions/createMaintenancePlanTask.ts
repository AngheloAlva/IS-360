import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { generateSlug } from "@/lib/generateSlug"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import type { MaintenancePlanTaskSchema } from "@/project/maintenance-plan/schemas/maintenance-plan-task.schema"
import type { UploadResult } from "@/lib/upload-files"

interface CreateMaintenancePlanTaskValues {
	values: MaintenancePlanTaskSchema
	attachments: UploadResult[]
}

const getNormalizedEquipmentIds = (
	values: MaintenancePlanTaskSchema,
	fallbackId: string,
): string[] => {
	const ids = values.equipmentIds?.length
		? values.equipmentIds
		: values.equipmentId
			? [values.equipmentId]
			: [fallbackId]
	return [...new Set(ids)].filter(Boolean)
}

export const createMaintenancePlanTask = async ({
	values,
	attachments,
}: CreateMaintenancePlanTaskValues) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()

		const planResult = await db.query<{ id: string; equipmentId: string }>(
			`SELECT id, "equipmentId" FROM "maintenance_plan" WHERE slug = $1`,
			[values.maintenancePlanSlug],
		)
		const plan = planResult.rows[0]
		if (!plan) {
			return { ok: false, message: "Plan de mantenimiento no encontrado" }
		}

		const taskSlug = generateSlug(values.name)
		const equipmentIds = getNormalizedEquipmentIds(values, plan.equipmentId)

		const id = crypto.randomUUID()
		const now = new Date().toISOString()
		const nextDate = new Date(values.nextDate)

		await db.query(
			`INSERT INTO "maintenance_plan_task" (
				id, slug, name, description, frequency, "nextDate", "originalDayOfMonth",
				specialty, "taskType", "emailsForCopy",
				"isAutomated", "automatedCompanyId", "automatedResponsibleId", "automatedSupervisorId",
				"automatedWorkOrderType", "automatedPriority", "automatedCapex",
				"automatedEstimatedDays", "automatedEstimatedDaysByMonth", "automatedEstimatedHours",
				"automatedDaysInAdvance", "automatedWorkDescription",
				"blockIfPreviousNotCompleted",
				"equipmentId", "maintenancePlanId", "createdById",
				"createdAt", "updatedAt"
			) VALUES (
				$1, $2, $3, $4, $5, $6, $7,
				$8, $9, $10,
				$11, $12, $13, $14,
				$15, $16, $17,
				$18, $19, $20,
				$21, $22,
				$23,
				$24, $25, $26,
				$27, $27
			)`,
			[
				id,
				taskSlug,
				values.name,
				values.description ?? null,
				values.frequency,
				nextDate.toISOString(),
				nextDate.getDate(),
				values.specialty ?? null,
				values.taskType ?? null,
				values.emailsForCopy ?? [],
				values.isAutomated ?? false,
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
				equipmentIds[0],
				plan.id,
				values.createdById,
				now,
			],
		)

		for (const eqId of equipmentIds) {
			await db.query(
				`INSERT INTO "_MaintenancePlanTaskEquipments" ("A", "B") VALUES ($1, $2)
				 ON CONFLICT DO NOTHING`,
				[eqId, id],
			)
		}

		for (const a of attachments) {
			await db.query(
				`INSERT INTO "attachment" (id, name, url, type, size, "maintenancePlanTaskId", "createdAt", "updatedAt")
				 VALUES ($1, $2, $3, $4, $5, $6, $7, $7)`,
				[crypto.randomUUID(), a.name, a.url, a.type, a.size, id, now],
			)
		}

		try {
			await logActivity({
				userId: values.createdById,
				module: MODULES.MAINTENANCE_PLANS,
				action: ACTIVITY_TYPE.CREATE,
				entityId: id,
				entityType: "MaintenancePlanTask",
				metadata: {
					name: values.name,
					frequency: values.frequency,
					maintenancePlanId: plan.id,
					equipmentId: equipmentIds[0],
					equipmentIds,
					nextDate: nextDate.toISOString(),
					slug: taskSlug,
				},
			})
		} catch {
			// audit best-effort
		}

		return { ok: true, message: "Tarea de mantenimiento creada exitosamente" }
	} catch (error) {
		console.error("[CREATE_MAINTENANCE_PLAN_TASK]", error)
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Error al crear la tarea de mantenimiento",
		}
	}
}
