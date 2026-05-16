import { VEHICLE_CONFIG } from "../../factory/configs"
import { submitForReview } from "../../factory/createFolderActions"

export const submitVehicleFolderForReview = ({
	emails,
	userId,
	vehicleId,
	folderId,
}: {
	userId: string
	vehicleId: string
	emails: string[]
	folderId: string
	companyId?: string
}) => submitForReview(VEHICLE_CONFIG, { emails, userId, folderId, vehicleId })
