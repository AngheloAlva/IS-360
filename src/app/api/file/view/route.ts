import { NextRequest, NextResponse } from "next/server"
import {
	generateSecureSasUrl,
	FILES_CONTAINER_NAME,
	DOCUMENTS_CONTAINER_NAME,
} from "@/lib/azure-storage-client"
import { validateFileAccess, logFileAccess } from "@/lib/file-security"

type ContainerType = "documents" | "files" | "startup" | "avatars" | "equipment"

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
		default:
			return "application/octet-stream"
	}
}

export async function GET(request: NextRequest) {
	try {
		const filename = request.nextUrl.searchParams.get("filename") as string
		const containerType =
			(request.nextUrl.searchParams.get("containerType") as ContainerType) || "documents"
		const companyId = request.nextUrl.searchParams.get("companyId") || undefined

		if (!filename) {
			return NextResponse.json({ error: "No se proporcionó nombre de archivo" }, { status: 400 })
		}

		const validation = await validateFileAccess({
			filename,
			containerType,
			action: "read",
			companyId,
		})

		await logFileAccess(
			{
				filename,
				containerType,
				action: "read",
				companyId,
			},
			validation,
			validation.allowed
		)

		if (!validation.allowed) {
			return NextResponse.json(
				{
					error: "Acceso denegado",
					reason: validation.reason,
				},
				{ status: 403 }
			)
		}

		const containerName =
			containerType === "documents" ? DOCUMENTS_CONTAINER_NAME : FILES_CONTAINER_NAME

		const viewUrl = await generateSecureSasUrl(containerName, filename, "read", 60, false)

		return NextResponse.json({
			url: viewUrl,
			filename,
			contentType: getContentTypeFromFilename(filename),
		})
	} catch (error: unknown) {
		console.error("Error en GET /api/file/view:", error)
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Error interno del servidor" },
			{ status: 500 }
		)
	}
}
