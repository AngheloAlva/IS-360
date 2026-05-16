import { VEHICLE_CONFIG } from "../../factory/configs"
import { createDocument, type CreateDocumentInput } from "../../factory/createFolderActions"

export interface CreateVehicleDocumentInput {
	url: string
	userId: string
	vehicleId: string
	documentType: string
	documentName: string
	expirationDate: Date
	startupFolderId: string
}

export const createVehicleDocument = (input: CreateVehicleDocumentInput) =>
	createDocument(VEHICLE_CONFIG, input satisfies CreateDocumentInput)
