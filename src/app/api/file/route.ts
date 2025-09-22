import { type NextRequest, NextResponse } from "next/server"

import { validateFileAccess, logFileAccess } from "@/lib/file-security"
import {
	generateSecureSasUrl,
	FILES_CONTAINER_NAME,
	DOCUMENTS_CONTAINER_NAME,
} from "@/lib/azure-storage-client"

type ContainerType = "documents" | "files" | "startup" | "avatars" | "equipment"

export async function POST(request: NextRequest) {
	try {
		const {
			filenames,
			containerType = "documents",
			companyId,
		}: {
			filenames: string[]
			containerType?: ContainerType
			companyId?: string
		} = await request.json()

		if (!filenames || filenames.length === 0) {
			return NextResponse.json(
				{ error: "No se proporcionaron nombres de archivo" },
				{ status: 400 }
			)
		}

		// Validar acceso para cada archivo
		const validationResults = await Promise.all(
			filenames.map(async (filename) => {
				const validation = await validateFileAccess({
					filename,
					containerType,
					action: "write",
					companyId,
				})

				// Registrar intento de acceso
				await logFileAccess(
					{
						filename,
						containerType,
						action: "write",
						companyId,
					},
					validation,
					validation.allowed
				)

				return { filename, validation }
			})
		)

		// Verificar si hay archivos no autorizados
		const unauthorizedFiles = validationResults.filter((r) => !r.validation.allowed)
		if (unauthorizedFiles.length > 0) {
			return NextResponse.json(
				{
					error: "Acceso denegado a algunos archivos",
					unauthorizedFiles: unauthorizedFiles.map((f) => ({
						filename: f.filename,
						reason: f.validation.reason,
					})),
				},
				{ status: 403 }
			)
		}

		const containerName =
			containerType === "documents" ? DOCUMENTS_CONTAINER_NAME : FILES_CONTAINER_NAME

		// Generar URLs SAS solo para archivos autorizados
		const urls = await Promise.all(
			filenames.map((filename) => generateSecureSasUrl(containerName, filename, "write", 10))
		)

		return NextResponse.json({ urls })
	} catch (error: unknown) {
		console.error("Error en POST /api/file:", error)
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Error interno del servidor" },
			{ status: 500 }
		)
	}
}

export async function GET(request: NextRequest) {
	try {
		const filename = request.nextUrl.searchParams.get("filename") as string
		const containerType = (request.nextUrl.searchParams.get("containerType") ||
			"documents") as ContainerType
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

		// Generar URL SAS para archivo autorizado
		const url = await generateSecureSasUrl(containerName, filename, "read", 60)

		return NextResponse.json({ url })
	} catch (error: unknown) {
		console.error("Error en GET /api/file:", error)
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Error interno del servidor" },
			{ status: 500 }
		)
	}
}
