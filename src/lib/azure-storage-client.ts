import { BlobServiceClient, BlobSASPermissions, SASProtocol } from "@azure/storage-blob"

export const DOCUMENTS_CONTAINER_NAME = process.env.AZURE_STORAGE_DOCUMENTS_CONTAINER_NAME as string
export const FILES_CONTAINER_NAME = process.env.AZURE_STORAGE_FILES_CONTAINER_NAME as string

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING

if (!connectionString) {
	throw new Error("Azure Storage connection string not found")
}

export const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
function getContentTypeFromFilename(filename: string): string {
	const ext = filename.toLowerCase().split(".").pop()

	switch (ext) {
		case "pdf":
			return "application/pdf"
		case "jpg":
		case "jpeg":
			return "image/jpeg"
		case "png":
			return "image/png"
		case "gif":
			return "image/gif"
		case "txt":
			return "text/plain"
		case "doc":
			return "application/msword"
		case "docx":
			return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
		case "xls":
			return "application/vnd.ms-excel"
		case "xlsx":
			return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		default:
			return "application/octet-stream"
	}
}

export function generateSecureSasUrl(
	containerName: string,
	blobName: string,
	permissions: "read" | "write" | "readwrite",
	expiryMinutes: number = 60,
	forceDownload: boolean = false
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

	const contentType = getContentTypeFromFilename(blobName)
	const sasOptions: {
		permissions: BlobSASPermissions
		expiresOn: Date
		protocol: SASProtocol
		contentType: string
		cacheControl: string
		contentDisposition?: string
	} = {
		permissions: sasPermissions,
		expiresOn: new Date(Date.now() + expiryMinutes * 60 * 1000),
		protocol: SASProtocol.Https,
		contentType,
		cacheControl: "no-cache",
	}

	// Si forzamos descarga o no es un tipo visualizable, agregar content-disposition
	if (
		forceDownload ||
		!["application/pdf", "image/jpeg", "image/png", "image/gif", "text/plain"].includes(contentType)
	) {
		sasOptions.contentDisposition = `attachment; filename="${blobName}"`
	} else {
		// Para PDFs e imágenes, usar inline para que se abran en el navegador
		sasOptions.contentDisposition = `inline; filename="${blobName}"`
	}

	return blobClient.generateSasUrl(sasOptions)
}
