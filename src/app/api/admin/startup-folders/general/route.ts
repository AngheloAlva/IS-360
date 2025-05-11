import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const GET = async () => {
	try {
		// Obtener todas las carpetas generales sin filtrar por empresa
		const folders = await prisma.generalStartupFolder.findMany({
			include: {
				company: true,
				documents: true,
				reviewer: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			orderBy: {
				updatedAt: "desc",
			},
		})

		return NextResponse.json(folders)
	} catch (error) {
		console.error("Error al obtener carpetas de arranque generales para admin:", error)
		return new NextResponse("Error al obtener carpetas de arranque", { status: 500 })
	}
}
