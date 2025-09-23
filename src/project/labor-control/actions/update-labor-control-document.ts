"use server"

import { z } from "zod"

import {
	MODULES,
	ACTIVITY_TYPE,
	LABOR_CONTROL_DOCUMENT_TYPE,
	WORKER_LABOR_CONTROL_DOCUMENT_TYPE,
} from "@prisma/client"
import { logActivity } from "@/lib/activity/log"

import { updateWorkerDocument } from "./worker/update-worker-document"

import type { UploadResult } from "@/lib/upload-files"

const updateDocumentSchema = z.object({
	documentId: z.string(),
	documentType: z.nativeEnum({
		...LABOR_CONTROL_DOCUMENT_TYPE,
		...WORKER_LABOR_CONTROL_DOCUMENT_TYPE,
	}),
	documentName: z.string(),
})

export type UpdateStartupFolderDocumentInput = z.infer<typeof updateDocumentSchema>

export async function updateStartupFolderDocument({
	data,
	userId,
	workerId,
	uploadedFile,
}: {
	userId: string
	workerId?: string
	uploadedFile: UploadResult
	data: UpdateStartupFolderDocumentInput
}) {
	const { documentId, documentName, documentType } = updateDocumentSchema.parse(data)

	logActivity({
		userId,
		module: MODULES.STARTUP_FOLDERS,
		action: ACTIVITY_TYPE.UPDATE,
		entityId: documentId,
		entityType: "StartupFolderDocument",
		metadata: {
			documentName,
			documentType,
			hasNewFile: !!uploadedFile,
		},
	})

	if (workerId) {
		return updateWorkerDocument({
			uploadedFile,
			data: {
				documentId,
				documentName,
				documentType,
				file: [],
			},
			userId,
		})
	}

	return {
		ok: false,
		message: "Documento no encontrado",
	}
}
