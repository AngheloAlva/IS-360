import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

const validateSession = async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return { error: "No autorizado", status: 401 }
	}

	return { session }
}

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	const { error, status } = await validateSession()

	if (error) {
		return new NextResponse(error, { status })
	}

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
				operator: {
					select: {
						name: true,
						email: true,
						image: true,
					},
				},
				equipments: {
					select: {
						id: true,
						name: true,
						tag: true,
						location: true,
					},
				},
				attachments: true,
				workOrders: {
					select: {
						id: true,
						otNumber: true,
						status: true,
						type: true,
						programDate: true,
						estimatedHours: true,
					},
					orderBy: {
						createdAt: "desc",
					},
				},
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
