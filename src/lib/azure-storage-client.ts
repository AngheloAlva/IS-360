/* eslint-disable @typescript-eslint/no-explicit-any */
import { BlobServiceClient } from "@azure/storage-blob"

export const DOCUMENTS_CONTAINER_NAME = process.env.AZURE_STORAGE_DOCUMENTS_CONTAINER_NAME as string
export const FILES_CONTAINER_NAME = process.env.AZURE_STORAGE_FILES_CONTAINER_NAME as string

// Lazy init: el throw se difiere hasta el primer uso real para que el módulo
// pueda importarse en builds de demo sin AZURE_STORAGE_CONNECTION_STRING.
// En modo demo MSW intercepta /api/file en el browser y este cliente nunca se invoca.
let _blobServiceClient: BlobServiceClient | null = null

function getBlobServiceClient(): BlobServiceClient {
	if (_blobServiceClient) return _blobServiceClient
	const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
	if (!connectionString) {
		throw new Error("Azure Storage connection string not found")
	}
	_blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
	return _blobServiceClient
}

export const blobServiceClient = new Proxy({} as BlobServiceClient, {
	get(_target, prop) {
		const client = getBlobServiceClient()
		const value = Reflect.get(client, prop, client)
		return typeof value === "function" ? value.bind(client) : value
	},
})

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

export async function generateSecureSasUrl(
	containerName: string,
	blobName: string,
	permissions: "read" | "write" | "readwrite",
	expiryMinutes: number = 60,
	forceDownload: boolean = false
) {
	// Dynamic import to avoid browser bundle issues
	const { BlobSASPermissions } = await import("@azure/storage-blob")

	const containerClient = blobServiceClient.getContainerClient(containerName)
	const blobClient = containerClient.getBlockBlobClient(blobName)

	// Use BlobSASPermissions.parse() to create valid permissions
	// "r" = read, "c" = create, "w" = write
	let sasPermissions
	switch (permissions) {
		case "read":
			sasPermissions = BlobSASPermissions.parse("r")
			break
		case "write":
			sasPermissions = BlobSASPermissions.parse("cw")
			break
		case "readwrite":
			sasPermissions = BlobSASPermissions.parse("rcw")
			break
		default:
			sasPermissions = BlobSASPermissions.parse("r")
	}

	const contentType = getContentTypeFromFilename(blobName)
	const sasOptions: {
		permissions: any
		expiresOn: Date
		protocol: any
		contentType: string
		cacheControl: string
		contentDisposition?: string
	} = {
		permissions: sasPermissions,
		expiresOn: new Date(Date.now() + expiryMinutes * 60 * 1000),
		protocol: "https",
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
