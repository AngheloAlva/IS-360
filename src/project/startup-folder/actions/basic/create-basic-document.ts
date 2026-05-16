import { createDocument, type CreateDocumentInput } from "../../factory/createFolderActions"
import { BASIC_CONFIG } from "../../factory/configs"

export interface CreateBasicDocumentInput {
	url: string
	userId: string
	workerId: string
	documentType: string
	documentName: string
	expirationDate: Date
	startupFolderId: string
}

export const createBasicDocument = (input: CreateBasicDocumentInput) =>
	createDocument(BASIC_CONFIG, input satisfies CreateDocumentInput)
