import { ENVIRONMENT_CONFIG } from "../../factory/configs"
import { updateDocument } from "../../factory/createFolderActions"

import type { UpdateStartupFolderDocumentSchema } from "../../schemas/update-file.schema"
import type { UploadResult } from "@/lib/upload-files"

export const updateEnvironmentDocument = (input: {
	data: UpdateStartupFolderDocumentSchema
	uploadedFile: UploadResult
	userId: string
}) => updateDocument(ENVIRONMENT_CONFIG, input)
