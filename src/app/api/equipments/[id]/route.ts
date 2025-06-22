import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const { id } = await params

		const equipment = await prisma.equipment.findUnique({
			where: {
				id,
			},
			include: {
				parent: {
					select: {
						id: true,
						name: true,
						tag: true,
					},
				},
				attachments: true,
				_count: {
					select: {
						children: true,
						workOrders: true,
					},
				},
			},
		})

		if (!equipment) {
			return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 })
		}

		return NextResponse.json(equipment)
	} catch (error) {
		console.error("[EQUIPMENT_GET_BY_ID]", error)
		return NextResponse.json({ error: "Error al obtener el equipo" }, { status: 500 })
	}
}
