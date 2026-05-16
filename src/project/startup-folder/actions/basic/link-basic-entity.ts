import { BASIC_CONFIG } from "../../factory/configs"
import { linkEntity } from "../../factory/createFolderActions"

export const linkBasicEntity = (params: {
	startupFolderId: string
	entityId: string
	userId: string
}) => linkEntity(BASIC_CONFIG, params)
