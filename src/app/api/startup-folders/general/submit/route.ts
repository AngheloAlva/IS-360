import prisma from "@/lib/prisma"

import { NextResponse } from "next/server"
import { z } from "zod"

// Schema para enviar una carpeta a revisión
const submitFolderSchema = z.object({
	folderId: z.string(),
})

// POST: Enviar carpeta a revisión
export async function POST(req: Request) {
	try {
		const body = await req.json()
		const validatedData = submitFolderSchema.parse(body)

		// Verificar que la carpeta exista y que el usuario tenga permisos
		const folder = await prisma.generalStartupFolder.findUnique({
			where: {
				id: validatedData.folderId,
			},
			include: {
				company: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		})

		if (!folder) {
			return NextResponse.json({ error: "Carpeta no encontrada" }, { status: 404 })
		}

		// Verificar que la carpeta esté en estado DRAFT o REJECTED para poder enviarla a revisión
		if (folder.status !== "DRAFT" && folder.status !== "REJECTED") {
			return NextResponse.json(
				{
					error:
						"No puedes enviar a revisión esta carpeta porque ya está en revisión o ya fue aprobada",
				},
				{ status: 400 }
			)
		}

		// Actualizar el estado de la carpeta
		const updatedFolder = await prisma.generalStartupFolder.update({
			where: {
				id: validatedData.folderId,
			},
			data: {
				status: "SUBMITTED",
				submittedAt: new Date(),
			},
		})

		// TODO: Enviar notificación por email al responsable de OTC
		// Aquí se puede implementar el envío de notificaciones por email
		// utilizando algún servicio como SendGrid, AWS SES, etc.

		return NextResponse.json(updatedFolder)
	} catch (error) {
		console.error("Error al enviar carpeta a revisión:", error)
		return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
	}
}
