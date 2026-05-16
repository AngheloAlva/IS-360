import { VEHICLE_CONFIG } from "../../factory/configs"
import { updateDocumentExpirationDate } from "../../factory/createFolderActions"

import type { UpdateExpirationDateSchema } from "../../schemas/update-expiration-date"

export const updateExpirationDateVehicleDocument = (input: { data: UpdateExpirationDateSchema }) =>
	updateDocumentExpirationDate(VEHICLE_CONFIG, input)
