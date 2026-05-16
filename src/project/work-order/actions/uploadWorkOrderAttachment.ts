import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import type { WorkOrderSchema } from "@/project/work-order/schemas/workOrder.schema"

interface UploadWorkOrderAttachmentProps {
	data: WorkOrderSchema
	fileUrl: string
	fileType: string
	workOrderId: string
	reportPhase: "init" | "end"
}

interface UploadWorkOrderAttachmentResponse {
	ok: boolean
	message?: string
}

export const uploadWorkOrderAttachment = async ({
	data,
	fileUrl,
	fileType,
	workOrderId,
	reportPhase,
}: UploadWorkOrderAttachmentProps): Promise<UploadWorkOrderAttachmentResponse> => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const id = crypto.randomUUID()
		const now = new Date().toISOString()

		await db.query(
			`INSERT INTO "attachment" ("id", "name", "url", "type", "createdAt", "updatedAt", ${
				reportPhase === "init" ? `"initReportId"` : `"endReportId"`
			})
			 VALUES ($1, $2, $3, $4, $5, $5, $6)`,
			[id, data.workRequest, fileUrl, fileType, now, workOrderId]
		)

		// Also link from work_order side
		await db.query(
			`UPDATE "work_order" SET ${
				reportPhase === "init" ? `"initReportId"` : `"endReportId"`
			} = $1, "updatedAt" = $2 WHERE "id" = $3`,
			[id, now, workOrderId]
		)

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_ORDERS,
				action: ACTIVITY_TYPE.UPLOAD,
				entityId: workOrderId,
				entityType: "WorkOrder",
				metadata: {
					fileUrl,
					fileType,
					name: data.workRequest,
					reportPhase,
					attachmentId: id,
				},
			})
		} catch {
			// audit best-effort
		}

		return { ok: true, message: "Archivo subido exitosamente" }
	} catch (error) {
		console.error(error)
		return { ok: false, message: (error as Error).message }
	}
}
