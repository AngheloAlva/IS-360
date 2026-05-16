import { VEHICLE_CONFIG } from "../../factory/configs"
import { updateDocument } from "../../factory/createFolderActions"

import type { UpdateStartupFolderDocumentSchema } from "../../schemas/update-file.schema"
import type { UploadResult } from "@/lib/upload-files"

export const updateVehicleDocument = (input: {
	data: UpdateStartupFolderDocumentSchema
	uploadedFile: UploadResult
	userId: string
}) => updateDocument(VEHICLE_CONFIG, input)
