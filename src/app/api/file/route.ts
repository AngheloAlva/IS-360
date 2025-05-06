import { BlobSASPermissions } from "@azure/storage-blob"
import {
	blobServiceClient,
	FILES_CONTAINER_NAME,
	DOCUMENTS_CONTAINER_NAME,
} from "@/lib/azure-storage-client"

import type { NextRequest } from "next/server"

type ContainerType = "documents" | "files"

export async function POST(request: NextRequest) {
	const {
		filenames,
		containerType = "documents",
	}: { filenames: string[]; containerType?: ContainerType } = await request.json()

	try {
		// Validar entrada
		if (!filenames || filenames.length === 0) {
			console.error("No se proporcionaron nombres de archivo")
			return Response.json({ error: "No se proporcionaron nombres de archivo" }, { status: 400 })
		}

		// Seleccionar el contenedor correcto basado en el tipo
		const containerName =
			containerType === "documents" ? DOCUMENTS_CONTAINER_NAME : FILES_CONTAINER_NAME

		const containerClient = blobServiceClient.getContainerClient(containerName)

		const urls = await Promise.all(
			filenames.map(async (filename) => {
				const blobClient = containerClient.getBlockBlobClient(filename)
				const permissions = new BlobSASPermissions()
				permissions.write = true
				permissions.create = true

				const url = await blobClient.generateSasUrl({
					permissions,
					expiresOn: new Date(Date.now() + 600 * 1000), // 10 minutes
					contentType: "application/octet-stream",
					cacheControl: "no-cache",
					contentDisposition: "attachment",
				})

				return url
			})
		)

		return Response.json({ urls })
	} catch (error: unknown) {
		console.error("Error en POST /api/file:", error)
		return Response.json(
			{ error: error instanceof Error ? error.message : "Error interno del servidor" },
			{ status: 500 }
		)
	}
}

export async function GET(request: NextRequest) {
	const filename = request.nextUrl.searchParams.get("filename") as string
	const containerType = request.nextUrl.searchParams.get("containerType") || "documents"

	try {
		// Validar entrada
		if (!filename) {
			console.error("No se proporcionó nombre de archivo")
			return Response.json({ error: "No se proporcionó nombre de archivo" }, { status: 400 })
		}

		// Seleccionar el contenedor correcto basado en el tipo
		const containerName =
			containerType === "documents" ? DOCUMENTS_CONTAINER_NAME : FILES_CONTAINER_NAME

		const containerClient = blobServiceClient.getContainerClient(containerName)

		const blobClient = containerClient.getBlockBlobClient(filename)
		const permissions = new BlobSASPermissions()
		permissions.read = true

		const url = await blobClient.generateSasUrl({
			permissions,
			expiresOn: new Date(Date.now() + 600 * 1000), // 10 minutes
		})

		return Response.json({ url })
	} catch (error: unknown) {
		console.error("Error en GET /api/file:", error)
		return Response.json(
			{ error: error instanceof Error ? error.message : "Error interno del servidor" },
			{ status: 500 }
		)
	}
}
