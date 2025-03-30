import { BlobServiceClient } from "@azure/storage-blob"

export const DOCUMENTS_CONTAINER_NAME = process.env.AZURE_STORAGE_DOCUMENTS_CONTAINER_NAME as string
export const FILES_CONTAINER_NAME = process.env.AZURE_STORAGE_FILES_CONTAINER_NAME as string

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING

if (!connectionString) {
	throw new Error("Azure Storage connection string not found")
}

export const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
export const containerClient = blobServiceClient.getContainerClient(DOCUMENTS_CONTAINER_NAME)
