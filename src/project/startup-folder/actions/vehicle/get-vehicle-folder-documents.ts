import { VEHICLE_CONFIG } from "../../factory/configs"
import { getFolderDocuments } from "../../factory/createFolderActions"

import type { VehicleStartupFolderDocument } from "../../types"
import type { ReviewStatus } from "@/generated/prisma/enums"

export async function getVehicleFolderDocuments({
	vehicleId,
	startupFolderId,
}: {
	vehicleId: string
	startupFolderId: string
}): Promise<{
	totalDocuments: number
	approvedDocuments: number
	folderStatus: ReviewStatus
	documents: VehicleStartupFolderDocument[]
}> {
	const result = await getFolderDocuments(VEHICLE_CONFIG, { entityId: vehicleId, startupFolderId })
	return {
		...result,
		documents: result.documents as unknown as VehicleStartupFolderDocument[],
	}
}
