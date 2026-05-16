import { BASIC_CONFIG } from "../../factory/configs"
import { getEntities } from "../../factory/createFolderActions"

export const getBasicEntities = (params: { companyId: string; startupFolderId: string }) =>
	getEntities(BASIC_CONFIG, params)
