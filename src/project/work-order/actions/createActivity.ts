import { UploadResult as UploadFileResult } from "@/lib/upload-files"
import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import type { DailyActivitySchema } from "@/project/work-order/schemas/daily-activity.schema"
import type { ENTRY_TYPE } from "@/generated/prisma/enums"

interface CreateActivityProps {
	entryType: ENTRY_TYPE
	values: DailyActivitySchema
	attachment?: UploadFileResult[]
}

// TODO(iter X): full implementation — personnel assignment + attachments cascade
export const createActivity = async ({
	values,
	entryType,
	attachment,
}: CreateActivityProps) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const id = crypto.randomUUID()
		const now = new Date().toISOString()
		const executionDate = new Date(values.executionDate).toISOString()

		await db.query(
			`INSERT INTO "work_book_entry" (
				"id", "entryType", "executionDate", "activityName",
				"activityStartTime", "activityEndTime", "comments",
				"workOrderId", "milestoneId", "createdById", "createdAt"
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
			[
				id,
				entryType,
				executionDate,
				values.activityName,
				values.activityStartTime,
				values.activityEndTime,
				values.comments || "",
				values.workOrderId,
				values.milestoneId,
				user.id,
				now,
			]
		)

		if (attachment?.length) {
			for (const a of attachment) {
				await db.query(
					`INSERT INTO "attachment" ("id", "name", "url", "type", "createdAt", "updatedAt", "workEntryId")
					 VALUES ($1, $2, $3, $4, $5, $5, $6)`,
					[crypto.randomUUID(), a.name, a.url, a.type, now, id]
				)
			}
		}

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_ORDERS,
				action: ACTIVITY_TYPE.CREATE,
				entityId: id,
				entityType: "WorkEntry",
				metadata: {
					entryType,
					workOrderId: values.workOrderId,
					milestoneId: values.milestoneId,
				},
			})
		} catch {
			// audit best-effort
		}

		return { ok: true, message: "Actividad creada exitosamente" }
	} catch (error) {
		console.error("[CREATE_ACTIVITY]", error)
		return { ok: false, message: "Error al crear la actividad" }
	}
}
