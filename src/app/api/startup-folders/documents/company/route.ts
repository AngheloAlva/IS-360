import { NextResponse } from "next/server"
import { z } from "zod"

import prisma from "@/lib/prisma"

// Schema para crear un documento
const createDocumentSchema = z.object({
	folderId: z.string(),
	name: z.string(),
	type: z.any(),
	fileType: z.string().optional(),
	url: z.string().url(),
	uploadedById: z.string().optional(),
})

// Schema para actualizar un documento
const updateDocumentSchema = z.object({
	documentId: z.string(),
	url: z.string().url(),
})

// POST: Crear un nuevo documento
export async function POST(req: Request) {
	try {
		// Nota: La autenticación ya se maneja en middleware
		const body = await req.json()
		const validatedData = createDocumentSchema.parse(body)

		// Verificar que la carpeta exista
		const folder = await prisma.generalStartupFolder.findUnique({
			where: {
				id: validatedData.folderId,
			},
			include: {
				company: true,
			},
		})

		if (!folder) {
			return NextResponse.json({ error: "Carpeta no encontrada" }, { status: 404 })
		}

		// Verificar que la carpeta esté en estado DRAFT o REJECTED para poder modificar documentos
		if (folder.status !== "DRAFT" && folder.status !== "REJECTED") {
			return NextResponse.json(
				{
					error:
						"No puedes modificar documentos en esta carpeta porque está en revisión o ya fue aprobada",
				},
				{ status: 400 }
			)
		}

		// Crear el documento
		const documentData = {
			folder: {
				connect: {
					id: validatedData.folderId,
				},
			},
			name: validatedData.name,
			type: validatedData.type,
			url: validatedData.url,
			uploadedAt: new Date(),
			fileType: "",
		}

		// Solo agregar fileType si está definido
		if (validatedData.fileType) {
			documentData.fileType = validatedData.fileType
		}

		// Crear el documento
		const document = await prisma.companyDocument.create({
			data: documentData,
		})

		return NextResponse.json(document, { status: 201 })
	} catch (error) {
		console.error("Error al crear documento:", error)
		return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
	}
}

// PUT: Actualizar un documento existente
export async function PUT(req: Request) {
	try {
		const body = await req.json()
		const validatedData = updateDocumentSchema.parse(body)

		// Buscar el documento existente
		const existingDocument = await prisma.companyDocument.findUnique({
			where: {
				id: validatedData.documentId,
			},
			include: {
				folder: {
					include: {
						company: true,
					},
				},
			},
		})

		if (!existingDocument) {
			return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 })
		}

		// Verificar que la carpeta esté en estado DRAFT o REJECTED para poder modificar documentos
		if (
			existingDocument.folder.status !== "DRAFT" &&
			existingDocument.folder.status !== "REJECTED"
		) {
			return NextResponse.json(
				{
					error:
						"No puedes modificar documentos en esta carpeta porque está en revisión o ya fue aprobada",
				},
				{ status: 400 }
			)
		}

		// Actualizar el documento
		const updatedDocument = await prisma.companyDocument.update({
			where: {
				id: validatedData.documentId,
			},
			data: {
				url: validatedData.url,
				uploadedAt: new Date(),
			},
		})

		return NextResponse.json(updatedDocument)
	} catch (error) {
		console.error("Error al actualizar documento:", error)
		return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
	}
}
