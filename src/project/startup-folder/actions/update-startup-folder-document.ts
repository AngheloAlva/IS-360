import { z } from "zod"

import { MODULES, ACTIVITY_TYPE, EnvironmentDocType, TechSpecsDocumentType } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import {
	DocumentCategory,
	BasicDocumentType,
	WorkerDocumentType,
	VehicleDocumentType,
	EnvironmentalDocType,
	SafetyAndHealthDocumentType,
} from "@/generated/prisma/enums"

import { updateEnvironmentalDocument } from "./environmental/update-environmental-document"
import { updateSafetyAndHealthDocument } from "./safety-and-health/update-safety-document"
import { updateEnvironmentDocument } from "./environment/update-environment-document"
import { updateVehicleDocument } from "./vehicle/update-vehicle-document"
import { updateWorkerDocument } from "./worker/update-worker-document"
import { updateBasicDocument } from "./basic/update-basic-document"

import type { UploadResult } from "@/lib/upload-files"
import { updateTechSpecsDocument } from "./technical-specs/update-technical-document"

const updateDocumentSchema = z.object({
	documentId: z.string(),
	expirationDate: z.date(),
	category: z.nativeEnum(DocumentCategory),
	documentType: z.nativeEnum({
		...BasicDocumentType,
		...WorkerDocumentType,
		...EnvironmentDocType,
		...VehicleDocumentType,
		...EnvironmentalDocType,
		...TechSpecsDocumentType,
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
	try {
		const { documentId, category, expirationDate, documentName, documentType } =
			updateDocumentSchema.parse(data)

		try {
			await logActivity({
				userId,
				module: MODULES.STARTUP_FOLDERS,
				action: ACTIVITY_TYPE.UPDATE,
				entityId: documentId,
				entityType: "StartupFolderDocument",
				metadata: {
					documentName,
					documentType,
					category,
					expirationDate: expirationDate.toISOString(),
					hasNewFile: !!uploadedFile,
				},
			})
		} catch {
			// audit best-effort
		}

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

			case "ENVIRONMENT":
				return updateEnvironmentDocument({
					data: {
						documentId,
						documentName,
						expirationDate,
						documentType: documentType as EnvironmentDocType,
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

			case "TECHNICAL_SPECS": {
				return await updateTechSpecsDocument({
					data: {
						documentId,
						expirationDate,
						documentType: documentType as TechSpecsDocumentType,
						documentName,
						file: [],
					},
					uploadedFile,
					userId,
				})
			}

			case "BASIC":
				return updateBasicDocument({
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
	} catch (error) {
		console.error("Error updating startup folder document:", error)
		throw error
	}
}
