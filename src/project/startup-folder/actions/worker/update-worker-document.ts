import { WORKER_CONFIG } from "../../factory/configs"
import { updateDocument } from "../../factory/createFolderActions"

import type { UpdateStartupFolderDocumentSchema } from "../../schemas/update-file.schema"
import type { UploadResult } from "@/lib/upload-files"

export const updateWorkerDocument = ({
	file,
	data,
	userId,
}: {
	file: UploadResult
	data: UpdateStartupFolderDocumentSchema
	userId: string
}) => updateDocument(WORKER_CONFIG, { data, uploadedFile: file, userId })
