import { NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params

		const workRequest = await prisma.workRequest.findUnique({
			where: {
				id,
			},
			include: {
				user: {
					select: {
						name: true,
						email: true,
						image: true,
						company: {
							select: {
								name: true,
							},
						},
					},
				},
				attachments: true,
				comments: {
					include: {
						user: {
							select: {
								name: true,
								email: true,
								image: true,
							},
						},
					},
					orderBy: {
						createdAt: "asc",
					},
				},
			},
		})

		if (!workRequest) {
			throw new Error("Solicitud no encontrada")
		}

		return NextResponse.json(workRequest)
	} catch (error) {
		console.error("Error al obtener la solicitud de trabajo:", error)
		return NextResponse.json({ error: "Error al obtener la solicitud de trabajo" }, { status: 500 })
	}
}
