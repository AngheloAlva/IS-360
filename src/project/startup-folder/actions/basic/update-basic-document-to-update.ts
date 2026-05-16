import { BASIC_CONFIG } from "../../factory/configs"
import { updateDocumentToUpdate } from "../../factory/createFolderActions"

export interface UpdateBasicDocumentToUpdateParams {
	documentIds: string[]
	startupFolderId: string
}

export const updateBasicDocumentToUpdate = (params: UpdateBasicDocumentToUpdateParams) =>
	updateDocumentToUpdate(BASIC_CONFIG, params)
