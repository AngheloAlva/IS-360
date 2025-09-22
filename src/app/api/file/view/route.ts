import { NextRequest, NextResponse } from "next/server"
import {
	generateSecureSasUrl,
	FILES_CONTAINER_NAME,
	DOCUMENTS_CONTAINER_NAME,
} from "@/lib/azure-storage-client"
import { validateFileAccess, logFileAccess } from "@/lib/file-security"

type ContainerType = "documents" | "files" | "startup" | "avatars" | "equipment"

export async function GET(request: NextRequest) {
	try {
		const filename = request.nextUrl.searchParams.get("filename") as string
		const containerType =
			(request.nextUrl.searchParams.get("containerType") as ContainerType) || "documents"
		const companyId = request.nextUrl.searchParams.get("companyId") || undefined

		if (!filename) {
			return NextResponse.json({ error: "No se proporcionó nombre de archivo" }, { status: 400 })
		}

		// Validar acceso al archivo
		const validation = await validateFileAccess({
			filename,
			containerType,
			action: "read",
			companyId,
		})

		// Registrar intento de acceso
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

		// Generar URL SAS con permisos de solo lectura y expiración de 1 hora
		const viewUrl = await generateSecureSasUrl(containerName, filename, "read", 60)

		// Redirigir directamente al archivo con la URL SAS
		return NextResponse.redirect(viewUrl)
	} catch (error: unknown) {
		console.error("Error en GET /api/file/view:", error)
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Error interno del servidor" },
			{ status: 500 }
		)
	}
}
