import { TECH_SPECS_CONFIG } from "../../factory/configs"
import { updateDocumentToUpdate } from "../../factory/createFolderActions"

export const updateTechnicalDocumentToUpdate = (params: {
	documentIds: string[]
	startupFolderId: string
}) => updateDocumentToUpdate(TECH_SPECS_CONFIG, params)
