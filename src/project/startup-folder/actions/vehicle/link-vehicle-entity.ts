import { VEHICLE_CONFIG } from "../../factory/configs"
import { linkEntity } from "../../factory/createFolderActions"

export const linkVehicleEntity = (params: {
	startupFolderId: string
	entityId: string
	userId: string
}) => linkEntity(VEHICLE_CONFIG, params)
