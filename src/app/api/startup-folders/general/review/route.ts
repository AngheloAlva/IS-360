import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

// Schema para revisar una carpeta
const reviewFolderSchema = z.object({
	folderId: z.string(),
	status: z.enum(["APPROVED", "REJECTED"]),
	comments: z.string().nullable(),
	reviewerId: z.string(),
})

// POST: Revisar carpeta
export async function POST(req: Request) {
	try {
		const body = await req.json()
		const validatedData = reviewFolderSchema.parse(body)

		// Verificar que la carpeta exista
		const folder = await prisma.generalStartupFolder.findUnique({
			where: {
				id: validatedData.folderId,
			},
			include: {
				company: {
					select: {
						id: true,
						name: true,
						users: {
							select: {
								id: true,
							},
							where: {
								role: "SUPERVISOR",
							},
						},
					},
				},
			},
		})

		if (!folder) {
			return NextResponse.json({ error: "Carpeta no encontrada" }, { status: 404 })
		}

		// Verificar que la carpeta esté en estado SUBMITTED para poder revisarla
		if (folder.status !== "SUBMITTED") {
			return NextResponse.json(
				{ error: "No puedes revisar esta carpeta porque no está en estado de revisión" },
				{ status: 400 }
			)
		}

		// Si se rechaza, verificar que se hayan proporcionado comentarios
		if (validatedData.status === "REJECTED" && !validatedData.comments) {
			return NextResponse.json(
				{ error: "Debes proporcionar comentarios al rechazar una carpeta" },
				{ status: 400 }
			)
		}

		// Actualizar el estado de la carpeta
		const updatedFolder = await prisma.generalStartupFolder.update({
			where: {
				id: validatedData.folderId,
			},
			data: {
				reviewedAt: new Date(),
				status: validatedData.status,
				reviewNotes: validatedData.comments,
				reviewedById: validatedData.reviewerId,
			},
		})

		// TODO: Enviar notificación por email al supervisor de la empresa
		// Aquí se puede implementar el envío de notificaciones por email
		// utilizando algún servicio como SendGrid, AWS SES, etc.

		return NextResponse.json(updatedFolder)
	} catch (error) {
		console.error("Error al revisar carpeta:", error)
		return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
	}
}
