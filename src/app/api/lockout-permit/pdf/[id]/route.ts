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

		const lockoutPermit = await prisma.lockoutPermit.findUnique({
			where: {
				id,
			},
			include: {
				supervisor: {
					select: {
						name: true,
						rut: true,
					},
				},
				operator: {
					select: {
						name: true,
						rut: true,
					},
				},
				removeLockout: {
					select: {
						name: true,
						rut: true,
					},
				},
				areaResponsible: {
					select: {
						name: true,
						rut: true,
					},
				},
				requestedBy: {
					select: {
						name: true,
						rut: true,
					},
				},
				company: {
					select: {
						name: true,
						rut: true,
					},
				},
				otNumberRef: {
					select: {
						otNumber: true,
						workRequest: true,
						workDescription: true,
					},
				},
				equipments: {
					select: {
						name: true,
						tag: true,
						location: true,
					},
				},
				lockoutRegistrations: {
					orderBy: { order: "asc" },
					select: {
						id: true,
						order: true,
						name: true,
						rut: true,
						lockNumber: true,
						installDate: true,
						installTime: true,
						removeDate: true,
						removeTime: true,
					},
				},
				zeroEnergyReviews: {
					select: {
						id: true,
						location: true,
						action: true,
						reviewedZero: true,
						equipment: {
							select: {
								name: true,
								tag: true,
								location: true,
							},
						},
						performedBy: {
							select: {
								name: true,
								rut: true,
							},
						},
						reviewer: {
							select: {
								name: true,
								rut: true,
							},
						},
					},
				},
			},
		})

		if (!lockoutPermit) {
			return NextResponse.json({ error: "Permiso de bloqueo no encontrado" }, { status: 404 })
		}

		return NextResponse.json(lockoutPermit)
	} catch (error) {
		console.error("Error obteniendo datos del permiso de bloqueo:", error)
		return NextResponse.json(
			{ error: "Error obteniendo datos del permiso de bloqueo" },
			{ status: 500 }
		)
	}
}
