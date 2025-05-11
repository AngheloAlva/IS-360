import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const GET = async () => {
	try {
		// Obtener todas las carpetas de órdenes de trabajo sin filtrar por empresa
		const folders = await prisma.workOrderStartupFolder.findMany({
			include: {
				workOrder: {
					include: {
						company: true,
					},
				},
				workers: true,
				vehicles: true,
				procedures: true,
				environmentals: true,
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
		console.error("Error al obtener carpetas de arranque de órdenes para admin:", error)
		return new NextResponse("Error al obtener carpetas de arranque de órdenes", { status: 500 })
	}
}
