import { ENVIRONMENT_CONFIG } from "../../factory/configs"
import { updateDocumentExpirationDate } from "../../factory/createFolderActions"

import type { UpdateExpirationDateSchema } from "../../schemas/update-expiration-date"

export const updateEnvironmentDocumentExpirationDate = (input: {
	data: UpdateExpirationDateSchema
}) => updateDocumentExpirationDate(ENVIRONMENT_CONFIG, input)
