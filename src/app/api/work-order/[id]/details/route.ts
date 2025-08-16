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

		if (!id) {
			return new NextResponse("ID de orden de trabajo requerido", { status: 400 })
		}

		const workOrderDetails = await prisma.workOrder.findUnique({
			where: { id },
			select: {
				id: true,
				otNumber: true,
				solicitationDate: true,
				type: true,
				status: true,
				capex: true,
				solicitationTime: true,
				workRequest: true,
				workDescription: true,
				progress: true,
				priority: true,
				createdAt: true,
				programDate: true,
				estimatedHours: true,
				estimatedDays: true,
				estimatedEndDate: true,
				initReport: {
					select: {
						url: true,
						name: true,
					},
				},
				endReport: {
					select: {
						url: true,
						name: true,
					},
				},
				equipments: {
					select: {
						id: true,
						name: true,
					},
				},
				company: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
				supervisor: {
					select: {
						id: true,
						name: true,
					},
				},
				responsible: {
					select: {
						id: true,
						name: true,
					},
				},
				_count: {
					select: {
						workBookEntries: {
							where: {
								entryType: { in: ["ADDITIONAL_ACTIVITY", "DAILY_ACTIVITY"] },
							},
						},
					},
				},
				milestones: {
					select: {
						id: true,
						name: true,
						status: true,
						weight: true,
					},
					orderBy: {
						order: "asc",
					},
				},
			},
		})

		if (!workOrderDetails) {
			return new NextResponse("Orden de trabajo no encontrada", { status: 404 })
		}

		return NextResponse.json(workOrderDetails)
	} catch (error) {
		console.error("[WORK_ORDER_DETAILS_GET]", error)
		return NextResponse.json(
			{ error: "Error al obtener detalles de la orden de trabajo" },
			{ status: 500 }
		)
	}
}
