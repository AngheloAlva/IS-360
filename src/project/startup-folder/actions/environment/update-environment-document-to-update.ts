import { ENVIRONMENT_CONFIG } from "../../factory/configs"
import { updateDocumentToUpdate } from "../../factory/createFolderActions"

export const updateEnvironmentDocumentToUpdate = (params: {
	documentIds: string[]
	startupFolderId: string
}) => updateDocumentToUpdate(ENVIRONMENT_CONFIG, params)
