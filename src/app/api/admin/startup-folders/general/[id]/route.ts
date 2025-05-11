import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		// Validar el ID de la carpeta
		if (!id) {
			return new NextResponse("ID de carpeta no proporcionado", { status: 400 })
		}

		// Obtener la carpeta con sus documentos y datos de la empresa
		const folder = await prisma.generalStartupFolder.findUnique({
			where: {
				id,
			},
			include: {
				company: true,
				documents: {
					orderBy: {
						name: "asc",
					},
				},
				reviewer: {
					select: {
						id: true,
						name: true,
					},
				},
				submittedBy: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		})

		if (!folder) {
			return new NextResponse("Carpeta no encontrada", { status: 404 })
		}

		return NextResponse.json(folder)
	} catch (error) {
		console.error("Error al obtener la carpeta:", error)
		return new NextResponse("Error al obtener la carpeta", { status: 500 })
	}
}
