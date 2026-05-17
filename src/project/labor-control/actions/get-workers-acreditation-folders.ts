import { getDemoDb } from "@/lib/demo-db/client"

import type { WorkerLaborControlFolder } from "../types"

export async function getWorkersAcreditacionFolders({ folderId }: { folderId: string }): Promise<{
	workerFolders: WorkerLaborControlFolder[]
}> {
	try {
		const db = await getDemoDb()
		const result = await db.query<{
			id: string
			status: string
			workerId: string
			worker_id: string | null
			worker_rut: string | null
			worker_name: string | null
		}>(
			`SELECT
				wlcf.id, wlcf.status, wlcf."workerId",
				u.id AS "worker_id", u.rut AS "worker_rut", u.name AS "worker_name"
			 FROM "WorkerLaborControlFolder" wlcf
			 LEFT JOIN "user" u ON u.id = wlcf."workerId"
			 WHERE wlcf."laborControlFolderId" = $1
			 ORDER BY u.name ASC`,
			[folderId],
		)

		const workerFolders = result.rows.map((row) => ({
			id: row.id,
			status: row.status as WorkerLaborControlFolder["status"],
			workerId: row.workerId,
			worker: row.worker_id
				? { id: row.worker_id, rut: row.worker_rut, name: row.worker_name }
				: null,
		})) as WorkerLaborControlFolder[]

		return { workerFolders }
	} catch (error) {
		console.error("Error fetching worker folders:", error)
		throw new Error("Could not fetch worker folders")
	}
}
