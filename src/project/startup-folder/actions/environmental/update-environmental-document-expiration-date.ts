import { ENVIRONMENTAL_CONFIG } from "../../factory/configs"
import { updateDocumentExpirationDate } from "../../factory/createFolderActions"

import type { UpdateExpirationDateSchema } from "../../schemas/update-expiration-date"

export const updateEnvironmentalDocumentExpirationDate = (input: {
	data: UpdateExpirationDateSchema
}) => updateDocumentExpirationDate(ENVIRONMENTAL_CONFIG, input)
