import { SAFETY_AND_HEALTH_CONFIG } from "../../factory/configs"
import { updateDocumentExpirationDate } from "../../factory/createFolderActions"

import type { UpdateExpirationDateSchema } from "../../schemas/update-expiration-date"

export const updateSafetyDocumentExpirationDate = (input: { data: UpdateExpirationDateSchema }) =>
	updateDocumentExpirationDate(SAFETY_AND_HEALTH_CONFIG, input)
