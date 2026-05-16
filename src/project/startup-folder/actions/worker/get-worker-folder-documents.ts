import { WORKER_CONFIG } from "../../factory/configs"
import { getFolderDocuments } from "../../factory/createFolderActions"
import { getDemoDb } from "@/lib/demo-db/client"

import type { WorkerStartupFolderDocument } from "../../types"
import type { ReviewStatus } from "@/generated/prisma/enums"

export async function getWorkerFolderDocuments({
	workerId,
	startupFolderId,
}: {
	workerId: string
	startupFolderId: string
}): Promise<{
	totalDocuments: number
	approvedDocuments: number
	folderStatus: ReviewStatus
	documents: WorkerStartupFolderDocument[]
	isDriver: boolean
}> {
	const result = await getFolderDocuments(WORKER_CONFIG, { entityId: workerId, startupFolderId })

	const db = await getDemoDb()
	const driverRes = await db.query<{ isDriver: boolean | null }>(
		`SELECT "isDriver" FROM "worker_folders"
		 WHERE "workerId" = $1 AND "startupFolderId" = $2 LIMIT 1`,
		[workerId, startupFolderId],
	)

	return {
		...result,
		documents: result.documents as unknown as WorkerStartupFolderDocument[],
		isDriver: driverRes.rows[0]?.isDriver ?? true,
	}
}
