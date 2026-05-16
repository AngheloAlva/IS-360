import { VEHICLE_CONFIG } from "../../factory/configs"
import { updateDocumentToUpdate } from "../../factory/createFolderActions"

export const updateVehicleDocumentToUpdate = (params: {
	documentIds: string[]
	startupFolderId: string
}) => updateDocumentToUpdate(VEHICLE_CONFIG, params)
