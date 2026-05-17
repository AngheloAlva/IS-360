import { getDemoDb } from "@/lib/demo-db/client"

import type { LaborControlDocument } from "../types"
import type { LABOR_CONTROL_STATUS } from "@/generated/prisma/enums"

export async function getCompanyAcreditacionFolderDocuments({
	folderId,
}: {
	folderId: string
}): Promise<{
	documents: LaborControlDocument[]
	folderStatus: LABOR_CONTROL_STATUS
}> {
	try {
		const db = await getDemoDb()

		const folderRes = await db.query<{ companyFolderStatus: LABOR_CONTROL_STATUS }>(
			`SELECT "companyFolderStatus" FROM "LaborControlFolder" WHERE id = $1`,
			[folderId],
		)
		const folder = folderRes.rows[0]
		if (!folder) {
			throw new Error("Folder not found")
		}

		const result = await db.query<Record<string, unknown>>(
			`SELECT
				d.id, d.name, d.url, d.status, d."folderId",
				d."reviewById", d."reviewNotes", d."reviewDate", d."uploadDate", d."updatedAt",
				d."uploadById", d.type,
				ub.id AS "ub_id", ub.rut AS "ub_rut", ub.name AS "ub_name",
				ub.email AS "ub_email", ub.phone AS "ub_phone", ub.image AS "ub_image",
				rb.id AS "rb_id", rb.rut AS "rb_rut", rb.name AS "rb_name",
				rb.email AS "rb_email", rb.phone AS "rb_phone", rb.image AS "rb_image"
			 FROM "LaborControlDocument" d
			 LEFT JOIN "user" ub ON ub.id = d."uploadById"
			 LEFT JOIN "user" rb ON rb.id = d."reviewById"
			 WHERE d."folderId" = $1`,
			[folderId],
		)

		const documents = result.rows.map((row) => {
			const uploadBy = row.ub_id
				? {
						id: row.ub_id,
						rut: row.ub_rut,
						name: row.ub_name,
						email: row.ub_email,
						phone: row.ub_phone,
						image: row.ub_image,
					}
				: null
			const reviewBy = row.rb_id
				? {
						id: row.rb_id,
						rut: row.rb_rut,
						name: row.rb_name,
						email: row.rb_email,
						phone: row.rb_phone,
						image: row.rb_image,
					}
				: null
			return {
				id: row.id,
				name: row.name,
				url: row.url,
				status: row.status,
				folderId: row.folderId,
				reviewById: row.reviewById,
				reviewNotes: row.reviewNotes,
				reviewDate: row.reviewDate,
				uploadDate: row.uploadDate,
				updatedAt: row.updatedAt,
				uploadById: row.uploadById,
				type: row.type,
				uploadBy,
				reviewBy,
			}
		}) as unknown as LaborControlDocument[]

		return { documents, folderStatus: folder.companyFolderStatus }
	} catch (error) {
		console.error("Error fetching company labor control folder documents:", error)
		throw new Error("Could not fetch company labor control folder documents")
	}
}
