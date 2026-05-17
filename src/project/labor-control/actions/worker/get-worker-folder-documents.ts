import { getDemoDb } from "@/lib/demo-db/client"

import type { WorkerLaborControlDocument } from "../../types"
import type { LABOR_CONTROL_STATUS } from "@/generated/prisma/enums"

export async function getWorkerFolderDocuments({ folderId }: { folderId: string }): Promise<{
	workerId: string
	totalDocuments: number
	approvedDocuments: number
	folderStatus: LABOR_CONTROL_STATUS
	documents: WorkerLaborControlDocument[]
}> {
	try {
		const db = await getDemoDb()

		const folderRes = await db.query<{ status: LABOR_CONTROL_STATUS; workerId: string }>(
			`SELECT status, "workerId" FROM "WorkerLaborControlFolder" WHERE id = $1`,
			[folderId],
		)
		const folder = folderRes.rows[0]
		if (!folder) {
			return {
				workerId: "",
				folderStatus: "DRAFT",
				documents: [],
				totalDocuments: 0,
				approvedDocuments: 0,
			}
		}

		const docsRes = await db.query<Record<string, unknown>>(
			`SELECT
				d.*,
				ub.id AS "ub_id", ub.rut AS "ub_rut", ub.name AS "ub_name",
				ub.email AS "ub_email", ub.phone AS "ub_phone", ub.image AS "ub_image",
				rb.id AS "rb_id", rb.rut AS "rb_rut", rb.name AS "rb_name",
				rb.email AS "rb_email", rb.phone AS "rb_phone", rb.image AS "rb_image"
			 FROM "WorkerLaborControlDocument" d
			 LEFT JOIN "user" ub ON ub.id = d."uploadById"
			 LEFT JOIN "user" rb ON rb.id = d."reviewById"
			 WHERE d."folderId" = $1
			 ORDER BY d.name DESC`,
			[folderId],
		)

		const documents = docsRes.rows.map((row) => ({
			...row,
			uploadBy: row.ub_id
				? {
						id: row.ub_id,
						rut: row.ub_rut,
						name: row.ub_name,
						email: row.ub_email,
						phone: row.ub_phone,
						image: row.ub_image,
					}
				: null,
			reviewBy: row.rb_id
				? {
						id: row.rb_id,
						rut: row.rb_rut,
						name: row.rb_name,
						email: row.rb_email,
						phone: row.rb_phone,
						image: row.rb_image,
					}
				: null,
		})) as unknown as WorkerLaborControlDocument[]

		const totalDocuments = documents.length
		const approvedDocuments = documents.filter((d) => d.status === "APPROVED").length

		return {
			documents,
			folderStatus: folder.status,
			totalDocuments,
			approvedDocuments,
			workerId: folder.workerId,
		}
	} catch (error) {
		console.error("Error fetching worker folder documents:", error)
		throw new Error("Could not fetch worker folder documents")
	}
}
