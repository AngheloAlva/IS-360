import { ENVIRONMENTAL_CONFIG } from "../../factory/configs"
import { updateDocumentToUpdate } from "../../factory/createFolderActions"

export const updateEnvironmentalDocumentToUpdate = (params: {
	documentIds: string[]
	startupFolderId: string
}) => updateDocumentToUpdate(ENVIRONMENTAL_CONFIG, params)
