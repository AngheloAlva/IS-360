import { WORKER_CONFIG } from "../../factory/configs"
import { linkEntity } from "../../factory/createFolderActions"

export const linkWorkerEntity = (params: {
	startupFolderId: string
	entityId: string
	isDriver: boolean
	userId: string
}) => linkEntity(WORKER_CONFIG, params)
