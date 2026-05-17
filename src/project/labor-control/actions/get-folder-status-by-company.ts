import { getDemoDb } from "@/lib/demo-db/client"

import type { LABOR_CONTROL_STATUS } from "@/generated/prisma/enums"

export async function getFolderStatusByCompany({ folderId }: { folderId: string }): Promise<{
	companyAccreditationStatus: LABOR_CONTROL_STATUS
	workerAccreditationStatus: LABOR_CONTROL_STATUS
}> {
	try {
		const db = await getDemoDb()

		const workerRes = await db.query<{ status: LABOR_CONTROL_STATUS }>(
			`SELECT status FROM "WorkerLaborControlFolder" WHERE id = $1`,
			[folderId],
		)
		const companyRes = await db.query<{ status: LABOR_CONTROL_STATUS }>(
			`SELECT status FROM "LaborControlFolder" WHERE id = $1`,
			[folderId],
		)

		return {
			companyAccreditationStatus: companyRes.rows[0]?.status ?? "DRAFT",
			workerAccreditationStatus: workerRes.rows[0]?.status ?? "DRAFT",
		}
	} catch (error) {
		console.error("Error fetching folder status:", error)
		throw new Error("Could not fetch folder status")
	}
}
