import { WORKER_CONFIG } from "../../factory/configs"
import { updateDocumentExpirationDate } from "../../factory/createFolderActions"

import type { UpdateExpirationDateSchema } from "../../schemas/update-expiration-date"

export const updateWorkerDocumentExpirationDate = (input: { data: UpdateExpirationDateSchema }) =>
	updateDocumentExpirationDate(WORKER_CONFIG, input)
