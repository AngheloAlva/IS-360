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

		const workOrder = await prisma.workOrder.findUnique({
			where: {
				id,
			},
			include: {
				company: {
					select: {
						name: true,
						rut: true,
					},
				},
				supervisor: {
					select: {
						name: true,
						rut: true,
						internalRole: true,
					},
				},
				responsible: {
					select: {
						name: true,
						rut: true,
						internalRole: true,
					},
				},
				equipment: {
					select: {
						id: true,
						name: true,
						tag: true,
						location: true,
						description: true,
					},
				},
				milestones: {
					include: {
						activities: {
							include: {
								createdBy: {
									select: {
										name: true,
										rut: true,
									},
								},
								assignedUsers: {
									select: {
										name: true,
										rut: true,
									},
								},
							},
							orderBy: {
								createdAt: 'asc',
							},
						},
					},
					orderBy: {
						order: 'asc',
					},
				},
				workEntries: {
					include: {
						createdBy: {
							select: {
								name: true,
								rut: true,
							},
						},
						milestone: {
							select: {
								name: true,
							},
						},
						assignedUsers: {
							select: {
								name: true,
								rut: true,
							},
						},
					},
					orderBy: {
						createdAt: 'asc',
					},
				},
			},
			cacheStrategy: {
				ttl: 60,
				swr: 10,
			},
		})

		if (!workOrder) {
			return NextResponse.json({ error: "Orden de trabajo no encontrada" }, { status: 404 })
		}

		// Devolver los datos de la orden de trabajo
		return NextResponse.json(workOrder)
	} catch (error) {
		console.error("Error obteniendo datos de la orden de trabajo:", error)
		return NextResponse.json(
			{ error: "Error obteniendo datos de la orden de trabajo" },
			{ status: 500 }
		)
	}
}