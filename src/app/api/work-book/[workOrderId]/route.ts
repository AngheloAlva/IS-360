import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ workOrderId: string }> }
) {
	try {
		const { workOrderId } = await params

		const workBook = await prisma.workOrder.findUnique({
			where: {
				id: workOrderId,
			},
			include: {
				workEntries: {
					include: {
						createdBy: true,
						assignedUsers: true,
					},
				},
				company: {
					select: {
						id: true,
						rut: true,
						name: true,
						image: true,
					},
				},
				supervisor: {
					select: {
						id: true,
						rut: true,
						name: true,
						phone: true,
						email: true,
					},
				},
				responsible: {
					select: {
						id: true,
						rut: true,
						name: true,
						phone: true,
						email: true,
					},
				},
				equipment: {
					select: {
						id: true,
						tag: true,
						name: true,
						type: true,
						location: true,
						attachments: {
							select: {
								id: true,
								url: true,
								name: true,
							},
						},
					},
				},
				milestones: {
					select: {
						startDate: true,
					},
				},
				workPermits: {
					select: {
						participants: {
							select: {
								id: true,
								rut: true,
								name: true,
							},
						},
					},
				},
				_count: {
					select: {
						milestones: true,
					},
				},
			},
			cacheStrategy: {
				ttl: 10,
			},
		})

		if (!workBook) {
			return NextResponse.json({ error: "Libro de obras no encontrado" }, { status: 404 })
		}

		return NextResponse.json({ workBook })
	} catch (error) {
		console.error("Error fetching work book:", error)
		return NextResponse.json({ error: "Error al obtener el libro de obras" }, { status: 500 })
	}
}
