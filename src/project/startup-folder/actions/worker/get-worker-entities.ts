import { WORKER_CONFIG } from "../../factory/configs"
import { getEntities } from "../../factory/createFolderActions"

export const getWorkerEntities = (params: { companyId: string; startupFolderId: string }) =>
	getEntities(WORKER_CONFIG, params)
