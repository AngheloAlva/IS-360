import { BASIC_CONFIG } from "../../factory/configs"
import { updateDocumentExpirationDate } from "../../factory/createFolderActions"

import type { UpdateExpirationDateSchema } from "../../schemas/update-expiration-date"

export const updateBasicDocumentExpirationDate = (input: { data: UpdateExpirationDateSchema }) =>
	updateDocumentExpirationDate(BASIC_CONFIG, input)
