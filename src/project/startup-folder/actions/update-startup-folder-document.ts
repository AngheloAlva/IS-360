"use server"

import { z } from "zod"
import { DocumentCategory } from "@prisma/client"
import { type UploadResult } from "@/lib/upload-files"

import { updateWorkerDocument } from "./documents/worker"
import { updateVehicleDocument } from "./documents/vehicle"
import { updateEnvironmentalDocument } from "./documents/environmental"
import { updateSafetyAndHealthDocument } from "./documents/safety-and-health"

const updateDocumentSchema = z.object({
	documentId: z.string(),
	category: z.nativeEnum(DocumentCategory),
	expirationDate: z.date(),
})

export type UpdateStartupFolderDocumentInput = z.infer<typeof updateDocumentSchema>

export async function updateStartupFolderDocument({
	data,
	uploadedFile,
	userId,
}: {
	data: UpdateStartupFolderDocumentInput
	uploadedFile: UploadResult
	userId: string
}) {
	const { documentId, category, expirationDate } = updateDocumentSchema.parse(data)

	switch (category) {
		case "PERSONNEL":
			return updateWorkerDocument({
				file: uploadedFile,
				data: { documentId, expirationDate, file: [] },
				userId,
			})

		case "VEHICLES":
			return updateVehicleDocument({
				data: { documentId, expirationDate, file: [] },
				uploadedFile,
				userId,
			})

		case "ENVIRONMENTAL":
			return updateEnvironmentalDocument({
				data: { documentId, expirationDate, file: [] },
				uploadedFile,
				userId,
			})

		case "SAFETY_AND_HEALTH":
			return updateSafetyAndHealthDocument({
				data: { documentId, expirationDate, file: [] },
				uploadedFile,
				userId,
			})

		default:
			throw new Error(`Unsupported document category: ${category}`)
	}
}
