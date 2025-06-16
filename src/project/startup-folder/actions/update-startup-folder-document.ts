"use server"

import { z } from "zod"

import {
	DocumentCategory,
	WorkerDocumentType,
	VehicleDocumentType,
	EnvironmentalDocType,
	SafetyAndHealthDocumentType,
} from "@prisma/client"

import { updateSafetyAndHealthDocument } from "./documents/safety-and-health"
import { updateEnvironmentalDocument } from "./documents/environmental"
import { updateVehicleDocument } from "./documents/vehicle"
import { updateWorkerDocument } from "./documents/worker"

import type { UploadResult } from "@/lib/upload-files"

const updateDocumentSchema = z.object({
	documentId: z.string(),
	expirationDate: z.date(),
	category: z.nativeEnum(DocumentCategory),
	documentType: z.nativeEnum({
		...WorkerDocumentType,
		...VehicleDocumentType,
		...EnvironmentalDocType,
		...SafetyAndHealthDocumentType,
	}),
	documentName: z.string(),
})

export type UpdateStartupFolderDocumentInput = z.infer<typeof updateDocumentSchema>

export async function updateStartupFolderDocument({
	data,
	userId,
	uploadedFile,
}: {
	data: UpdateStartupFolderDocumentInput
	uploadedFile: UploadResult
	userId: string
}) {
	const { documentId, category, expirationDate, documentName, documentType } =
		updateDocumentSchema.parse(data)

	switch (category) {
		case "PERSONNEL":
			return updateWorkerDocument({
				file: uploadedFile,
				data: {
					documentId,
					documentName,
					expirationDate,
					documentType: documentType as WorkerDocumentType,
					file: [],
				},
				userId,
			})

		case "VEHICLES":
			return updateVehicleDocument({
				data: {
					documentId,
					documentName,
					expirationDate,
					documentType: documentType as VehicleDocumentType,
					file: [],
				},
				uploadedFile,
				userId,
			})

		case "ENVIRONMENTAL":
			return updateEnvironmentalDocument({
				data: {
					documentId,
					documentName,
					expirationDate,
					documentType: documentType as EnvironmentalDocType,
					file: [],
				},
				uploadedFile,
				userId,
			})

		case "SAFETY_AND_HEALTH":
			return updateSafetyAndHealthDocument({
				data: {
					documentId,
					documentName,
					expirationDate,
					documentType: documentType as SafetyAndHealthDocumentType,
					file: [],
				},
				uploadedFile,
				userId,
			})

		default:
			throw new Error(`Unsupported document category: ${category}`)
	}
}
