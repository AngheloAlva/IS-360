import { z } from "zod"

import { fileSchema } from "@/shared/schemas/file.schema"
import {
	WorkerDocumentType,
	VehicleDocumentType,
	EnvironmentalDocType,
	SafetyAndHealthDocumentType,
} from "@prisma/client"

export const updateStartupFolderDocumentSchema = z.object({
	documentId: z.string(),
	file: z.array(fileSchema).min(1, { message: "Se requiere subir un archivo" }),
	expirationDate: z.date({ message: "La fecha de vencimiento es requerida" }),
	documentName: z.string().optional(),
	documentType: z
		.nativeEnum({
			...WorkerDocumentType,
			...VehicleDocumentType,
			...EnvironmentalDocType,
			...SafetyAndHealthDocumentType,
		})
		.optional(),
})

export type UpdateStartupFolderDocumentSchema = z.infer<typeof updateStartupFolderDocumentSchema>
