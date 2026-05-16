import { TECH_SPECS_CONFIG } from "../../factory/configs"
import { updateDocumentExpirationDate } from "../../factory/createFolderActions"

import type { UpdateExpirationDateSchema } from "../../schemas/update-expiration-date"

export const updateExpirationDateTechSpecsDocument = (input: {
	data: UpdateExpirationDateSchema
}) => updateDocumentExpirationDate(TECH_SPECS_CONFIG, input)
