import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod"

// Esquema de validación para la solicitud de revisión
const reviewSchema = z.object({
	status: z.enum(["APPROVED", "REJECTED"]),
	reviewNotes: z.string().min(1, "Las notas de revisión son requeridas"),
})

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		// Validar el ID de la carpeta
		const { id } = await params
		if (!id) {
			return new NextResponse("ID de carpeta no proporcionado", { status: 400 })
		}

		// Obtener y validar los datos de la solicitud
		const body = await request.json()
		const validationResult = reviewSchema.safeParse(body)

		if (!validationResult.success) {
			return new NextResponse(
				JSON.stringify({
					message: "Datos de revisión inválidos",
					errors: validationResult.error.errors,
				}),
				{ status: 400 }
			)
		}

		const { status, reviewNotes } = validationResult.data

		// Verificar que la carpeta existe y está en estado SUBMITTED
		const folder = await prisma.generalStartupFolder.findUnique({
			where: {
				id,
			},
		})

		if (!folder) {
			return new NextResponse("Carpeta no encontrada", { status: 404 })
		}

		if (folder.status !== "SUBMITTED") {
			return new NextResponse("Solo se pueden revisar carpetas que estén en estado de revisión", {
				status: 400,
			})
		}

		// Actualizar el estado de la carpeta
		const updatedFolder = await prisma.generalStartupFolder.update({
			where: {
				id,
			},
			data: {
				status,
				reviewNotes,
				reviewedAt: new Date(),
				// En un sistema real, aquí se obtendría el ID del usuario autenticado
				// reviewedById: session.user.id,
			},
		})

		// TODO: Enviar notificación al contratista

		return NextResponse.json({
			message:
				status === "APPROVED"
					? "Carpeta aprobada correctamente"
					: "Carpeta rechazada correctamente",
			folder: updatedFolder,
		})
	} catch (error) {
		console.error("Error al procesar la revisión de la carpeta:", error)
		return new NextResponse("Error al procesar la revisión", { status: 500 })
	}
}
