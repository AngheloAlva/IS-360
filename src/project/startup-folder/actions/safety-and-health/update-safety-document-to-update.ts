import { SAFETY_AND_HEALTH_CONFIG } from "../../factory/configs"
import { updateDocumentToUpdate } from "../../factory/createFolderActions"

export const updateSafetyDocumentToUpdate = (params: {
	documentIds: string[]
	startupFolderId: string
}) => updateDocumentToUpdate(SAFETY_AND_HEALTH_CONFIG, params)
