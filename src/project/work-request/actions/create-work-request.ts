import { sendNewWorkRequestEmail } from "./send-new-work-request"
import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import type { WorkRequestSchema } from "@/project/work-request/schemas/work-request.schema"
import type { UploadResult as FileUploadResult } from "@/lib/upload-files"

interface CreateWorkRequestProps {
	userId: string
	values: WorkRequestSchema
	attachments?: FileUploadResult[]
}

export const createWorkRequest = async ({
	values,
	userId,
	attachments,
}: CreateWorkRequestProps) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No se pudo obtener la sesión del usuario" }
	}

	try {
		const db = await getDemoDb()

		await db.query(
			`INSERT INTO "work_request_counter" (id, value) VALUES ('work-request-counter', 1)
			 ON CONFLICT (id) DO UPDATE SET value = "work_request_counter".value + 1`,
		)
		const counterResult = await db.query<{ value: number }>(
			`SELECT value FROM "work_request_counter" WHERE id = 'work-request-counter'`,
		)
		const counterValue = counterResult.rows[0]?.value ?? 1
		const year = new Date().getFullYear()
		const requestNumber = `REQ-${year}-${String(counterValue).padStart(4, "0")}`

		const { workType, description, equipments, requestDate, isUrgent, observations, operatorId } =
			values

		const id = crypto.randomUUID()
		const now = new Date().toISOString()

		await db.query(
			`INSERT INTO "work_request" (
				id, "requestNumber", description, "isUrgent", "requestDate", observations,
				status, "operatorId", "workType", "userId", "createdAt", "updatedAt"
			) VALUES ($1, $2, $3, $4, $5, $6, 'REPORTED', $7, $8, $9, $10, $10)`,
			[
				id,
				requestNumber,
				description,
				isUrgent ?? false,
				new Date(requestDate).toISOString(),
				observations ?? null,
				operatorId || null,
				workType ?? null,
				userId,
				now,
			],
		)

		await db.query(
			`INSERT INTO "_EquipmentToWorkRequest" ("A", "B") VALUES ($1, $2)
			 ON CONFLICT DO NOTHING`,
			[equipments, id],
		)

		if (attachments && attachments.length > 0) {
			for (const a of attachments) {
				await db.query(
					`INSERT INTO "attachment" (id, name, url, type, "workRequestId", "createdAt", "updatedAt")
					 VALUES ($1, $2, $3, $4, $5, $6, $6)`,
					[crypto.randomUUID(), a.name, a.url, a.type || "image/jpeg", id, now],
				)
			}
		}

		const equipmentNameResult = await db.query<{ name: string }>(
			`SELECT name FROM "equipment" WHERE id = $1`,
			[equipments],
		)

		try {
			await sendNewWorkRequestEmail({
				requestDate: new Date(requestDate),
				description,
				observations: observations ?? null,
				requestNumber,
				userName: user.name,
				isUrgent: isUrgent ?? false,
				equipmentName: equipmentNameResult.rows.map((r) => r.name),
				baseUrl: "/admin/dashboard/solicitudes-de-trabajo",
			})
		} catch {
			// email best-effort
		}

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_REQUESTS,
				action: ACTIVITY_TYPE.CREATE,
				entityId: id,
				entityType: "WorkRequest",
				metadata: {
					requestNumber,
					description,
					isUrgent: isUrgent ?? false,
					requestDate,
					observations,
					workType,
					userId,
				},
			})
		} catch {
			// audit best-effort
		}

		return { success: "Solicitud de trabajo creada exitosamente", id }
	} catch (error) {
		console.error("Error al crear la solicitud de trabajo:", error)
		return { error: "Error al crear la solicitud de trabajo" }
	}
}
