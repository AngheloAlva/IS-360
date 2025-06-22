import { FileFormSchema } from "@/project/document/schemas/new-file.schema"
import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const formData = await req.formData()
		const files = formData.getAll("files") as File[]
		const data = JSON.parse(formData.get("data") as string) as Omit<FileFormSchema, "files">
		const { parentFolderId, userId, code, otherCode, ...rest } = data

		// Subir archivos a Azure y crear registros en la base de datos
		const results = await Promise.all(
			files.map(async (file) => {
				const fileExtension = file.name.split(".").pop()
				const uniqueFilename = `${Date.now()}-${Math.random()
					.toString(36)
					.substring(2, 9)}-${userId.slice(0, 4)}.${fileExtension}`

				// Obtener URL de subida para el contenedor de documentación
				const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/file`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						filenames: [uniqueFilename],
						containerType: "documents",
					}),
				})

				if (!response.ok) throw new Error("Error al obtener URL de subida")

				const uploadData = await response.json()
				if (!uploadData.urls?.[0]) throw new Error("Respuesta inválida del servidor")

				// Subir archivo a Azure Blob Storage
				const uploadResponse = await fetch(uploadData.urls[0], {
					method: "PUT",
					body: file,
					headers: {
						"Content-Type": file.type,
						"x-ms-blob-type": "BlockBlob",
					},
				})

				if (!uploadResponse.ok) {
					throw new Error("Error al subir archivo a Azure")
				}

				// Obtener la URL base del blob (sin los parámetros SAS)
				const blobUrl = uploadData.urls[0].split("?")[0]

				// Crear el registro en la base de datos
				return prisma.file.create({
					data: {
						...rest,
						url: blobUrl,
						size: file.size,
						type: file.type,
						name: rest.name || file.name,
						registrationDate: new Date(),
						user: { connect: { id: userId } },
						code: code || otherCode,
						...(parentFolderId ? { folder: { connect: { id: parentFolderId } } } : {}),
					},
				})
			})
		)

		return NextResponse.json({
			ok: true,
			data: results,
		})
	} catch (error: unknown) {
		console.error("Error en POST /api/documents/upload-multiple-files:", error)
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Error interno del servidor" },
			{ status: 500 }
		)
	}
}
