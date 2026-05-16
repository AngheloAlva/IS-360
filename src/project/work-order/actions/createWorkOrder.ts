import { generateOTNumber } from "@/project/work-order/actions/generateOTNumber"
import { sendNewWorkOrderEmail } from "./sendNewWorkOrderEmail"
import { ACTIVITY_TYPE, MODULES, type PLAN_FREQUENCY } from "@/generated/prisma/enums"
import { calculateNextDate } from "@/project/maintenance-plan/utils/calculate-next-date"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import type { WorkOrderSchema } from "@/project/work-order/schemas/workOrder.schema"
import type { UploadResult as FileUploadResult } from "@/lib/upload-files"

interface CreateWorkOrderProps {
	equipmentId?: string[]
	workRequestId?: string
	values: WorkOrderSchema
	maintenancePlanTaskId?: string[]
	initReportFile?: FileUploadResult
}

export const createWorkOrder = async ({
	values,
	equipmentId,
	workRequestId,
	initReportFile,
	maintenancePlanTaskId,
}: CreateWorkOrderProps) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const otNumber = await generateOTNumber()

		const {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			file,
			equipment,
			companyId,
			supervisorId,
			responsibleId,
			...rest
		} = values

		const equipmentIdsToConnect = [
			...new Set(equipmentId?.length ? equipmentId : equipment),
		]

		const id = crypto.randomUUID()
		const now = new Date().toISOString()
		const solicitationDate = rest.solicitationDate
			? new Date(rest.solicitationDate).toISOString()
			: now
		const solicitationTime = rest.solicitationTime
			? rest.solicitationTime
			: new Date().toTimeString().split(" ")[0]
		const estimatedEndDate = rest.estimatedEndDate
			? new Date(rest.estimatedEndDate).toISOString()
			: now
		const programDate = new Date(rest.programDate).toISOString()

		let initReportId: string | null = null
		if (initReportFile) {
			initReportId = crypto.randomUUID()
			await db.query(
				`INSERT INTO "attachment" ("id", "name", "url", "type", "createdAt", "updatedAt", "initReportId")
				 VALUES ($1, $2, $3, $4, $5, $5, $1)`,
				[
					initReportId,
					initReportFile.name,
					initReportFile.url,
					initReportFile.type,
					now,
				]
			)
		}

		const planTaskId = maintenancePlanTaskId?.[0] ?? null

		await db.query(
			`INSERT INTO "work_order" (
				"id", "otNumber", "type", "status", "progress",
				"solicitationDate", "solicitationTime", "workRequest", "workDescription",
				"priority", "capex", "programDate", "estimatedHours", "estimatedDays",
				"estimatedEndDate", "companyId", "supervisorId", "responsibleId",
				"initReportId", "maintenancePlanTaskId", "createdAt", "updatedAt"
			) VALUES (
				$1, $2, $3, 'PLANNED', 0,
				$4, $5, $6, $7,
				$8, $9, $10, $11, $12,
				$13, $14, $15, $16,
				$17, $18, $19, $19
			)`,
			[
				id,
				otNumber,
				rest.type,
				solicitationDate,
				solicitationTime,
				rest.workRequest,
				rest.workDescription ?? null,
				rest.priority,
				rest.capex,
				programDate,
				+rest.estimatedHours,
				+rest.estimatedDays,
				estimatedEndDate,
				companyId ?? null,
				supervisorId,
				responsibleId,
				initReportId,
				planTaskId,
				now,
			]
		)

		for (const equipmentIdToConnect of equipmentIdsToConnect) {
			await db.query(
				`INSERT INTO "_EquipmentToWorkOrder" ("A", "B") VALUES ($1, $2)
				 ON CONFLICT DO NOTHING`,
				[equipmentIdToConnect, id]
			)
		}

		if (planTaskId) {
			const taskResult = await db.query<{
				frequency: PLAN_FREQUENCY
				nextDate: string
				originalDayOfMonth: number | null
			}>(
				`SELECT frequency, "nextDate", "originalDayOfMonth"
				 FROM "maintenance_plan_task" WHERE id = $1`,
				[planTaskId],
			)
			const task = taskResult.rows[0]
			if (task) {
				const advanced = calculateNextDate(
					new Date(task.nextDate),
					task.frequency,
					task.originalDayOfMonth,
				)
				await db.query(
					`UPDATE "maintenance_plan_task"
					 SET "nextDate" = $1, "updatedAt" = $2 WHERE id = $3`,
					[advanced.toISOString(), now, planTaskId],
				)
			}
		}

		if (workRequestId) {
			await db.query(
				`UPDATE "work_request" SET "status" = 'ATTENDED', "updatedAt" = $1 WHERE "id" = $2`,
				[now, workRequestId]
			)
		}

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_ORDERS,
				action: ACTIVITY_TYPE.CREATE,
				entityId: id,
				entityType: "WorkOrder",
				metadata: { otNumber, type: rest.type, priority: rest.priority },
			})
		} catch {
			// audit best-effort
		}

		await sendNewWorkOrderEmail({
			workOrder: {
				otNumber,
				type: rest.type,
				priority: rest.priority,
				equipments: [],
				programDate: new Date(programDate),
				estimatedDays: +rest.estimatedDays,
				estimatedHours: +rest.estimatedHours,
				responsible: { name: user.name },
				workDescription: rest.workDescription ?? null,
				supervisor: { name: user.name, email: user.email },
			},
		})

		return { ok: true, message: "Orden de trabajo creado exitosamente" }
	} catch (error) {
		console.error("[CREATE_WORK_ORDER]", error)
		return { ok: false, message: "Error al crear el orden de trabajo" }
	}
}
