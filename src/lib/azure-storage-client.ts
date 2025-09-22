import { BlobServiceClient, BlobSASPermissions, SASProtocol } from "@azure/storage-blob"

export const DOCUMENTS_CONTAINER_NAME = process.env.AZURE_STORAGE_DOCUMENTS_CONTAINER_NAME as string
export const FILES_CONTAINER_NAME = process.env.AZURE_STORAGE_FILES_CONTAINER_NAME as string

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING

if (!connectionString) {
	throw new Error("Azure Storage connection string not found")
}

export const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
export function generateSecureSasUrl(
	containerName: string,
	blobName: string,
	permissions: "read" | "write" | "readwrite",
	expiryMinutes: number = 60
) {
	const containerClient = blobServiceClient.getContainerClient(containerName)
	const blobClient = containerClient.getBlockBlobClient(blobName)

	const sasPermissions = new BlobSASPermissions()

	switch (permissions) {
		case "read":
			sasPermissions.read = true
			break
		case "write":
			sasPermissions.write = true
			sasPermissions.create = true
			break
		case "readwrite":
			sasPermissions.read = true
			sasPermissions.write = true
			sasPermissions.create = true
			break
	}

	return blobClient.generateSasUrl({
		permissions: sasPermissions,
		expiresOn: new Date(Date.now() + expiryMinutes * 60 * 1000),
		protocol: SASProtocol.Https,
		contentType: "application/octet-stream",
		cacheControl: "no-cache",
	})
}
