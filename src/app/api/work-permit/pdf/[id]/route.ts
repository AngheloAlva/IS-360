import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const { id } = await params

		const workPermit = await prisma.workPermit.findUnique({
			where: {
				id,
			},
			include: {
				otNumber: {
					select: {
						otNumber: true,
						workName: true,
						supervisor: {
							select: {
								name: true,
								rut: true,
							},
						},
						responsible: {
							select: {
								name: true,
								rut: true,
							},
						},
					},
				},
				user: {
					select: {
						name: true,
						rut: true,
						internalRole: true,
					},
				},
				company: {
					select: {
						name: true,
						rut: true,
					},
				},
				participants: {
					select: {
						name: true,
						rut: true,
						internalRole: true,
					},
				},
			},
		})

		if (!workPermit) {
			return NextResponse.json({ error: "Permiso de trabajo no encontrado" }, { status: 404 })
		}

		// Devolver los datos del permiso de trabajo en lugar de generar el PDF
		return NextResponse.json(workPermit)
	} catch (error) {
		console.error("Error obteniendo datos del permiso de trabajo:", error)
		return NextResponse.json(
			{ error: "Error obteniendo datos del permiso de trabajo" },
			{ status: 500 }
		)
	}
}
