import { WORKER_CONFIG } from "../../factory/configs"
import { createDocument, type CreateDocumentInput } from "../../factory/createFolderActions"

export interface CreateWorkerDocumentInput {
	url: string
	userId: string
	workerId: string
	documentType: string
	documentName: string
	expirationDate: Date
	startupFolderId: string
}

export const createWorkerDocument = (input: CreateWorkerDocumentInput) =>
	createDocument(WORKER_CONFIG, input satisfies CreateDocumentInput)
