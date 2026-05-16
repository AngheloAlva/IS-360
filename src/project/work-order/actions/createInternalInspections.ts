import { sendInternalInspectionNotification } from "./sendInternalInspectionNotification"
import { UploadResult as UploadFilesResult } from "@/lib/upload-files"
import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"
import type { InternalInspectionSchema } from "@/project/work-order/schemas/internal-inspections.schema"

interface CreateInternalInspectionsProps {
	values: InternalInspectionSchema
	attachment?: UploadFilesResult[]
}

// TODO(iter X): full implementation — better milestone connect handling
export const createInternalInspections = async ({
	values,
	attachment,
}: CreateInternalInspectionsProps) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const id = crypto.randomUUID()
		const now = new Date().toISOString()
		const executionDate = new Date(values.executionDate).toISOString()

		const inspectionData: {
			nonConformities?: string
			safetyObservations?: string
			supervisionComments?: string
		} = {}

		for (const insp of values.inspections) {
			if (insp.type === "NO_CONFORMITY") {
				inspectionData.nonConformities = insp.inspection
			} else if (insp.type === "SAFETY_OBSERVATION") {
				inspectionData.safetyObservations = insp.inspection
			} else if (insp.type === "SUPERVISED_COMMENT") {
				inspectionData.supervisionComments = insp.inspection
			}
		}

		await db.query(
			`INSERT INTO "work_book_entry" (
				"id", "entryType", "executionDate", "activityName",
				"activityStartTime", "activityEndTime",
				"nonConformities", "safetyObservations", "supervisionComments",
				"workOrderId", "milestoneId", "createdById", "createdAt"
			) VALUES ($1, 'INTERNAL_INSPECTION', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
			[
				id,
				executionDate,
				values.inspectionName,
				values.activityStartTime,
				values.activityEndTime,
				inspectionData.nonConformities ?? null,
				inspectionData.safetyObservations ?? null,
				inspectionData.supervisionComments ?? null,
				values.workOrderId,
				values.milestoneId ?? null,
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
				entityType: "Inspection",
				metadata: { workOrderId: values.workOrderId },
			})
		} catch {
			// audit best-effort
		}

		await sendInternalInspectionNotification({ workEntryId: id })

		return { ok: true, message: "Inspección creada exitosamente" }
	} catch (error) {
		console.error("[CREATE_INTERNAL_INSPECTIONS]", error)
		return { ok: false, message: "Error al crear la inspección" }
	}
}
