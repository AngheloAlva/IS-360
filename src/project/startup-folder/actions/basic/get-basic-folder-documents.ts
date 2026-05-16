import { BASIC_CONFIG } from "../../factory/configs"
import { getFolderDocuments } from "../../factory/createFolderActions"

import type { BasicStartupFolderDocument } from "../../types"
import type { ReviewStatus } from "@/generated/prisma/enums"

export async function getBasicFolderDocuments({
	workerId,
	startupFolderId,
}: {
	workerId: string
	startupFolderId: string
}): Promise<{
	totalDocuments: number
	approvedDocuments: number
	folderStatus: ReviewStatus
	documents: BasicStartupFolderDocument[]
}> {
	const result = await getFolderDocuments(BASIC_CONFIG, { entityId: workerId, startupFolderId })
	return {
		...result,
		documents: result.documents as unknown as BasicStartupFolderDocument[],
	}
}
