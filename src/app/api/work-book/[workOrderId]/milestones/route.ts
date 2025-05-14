import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { MILESTONE_STATUS } from "@prisma/client"

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ workOrderId: string }> }
) {
	try {
		const { workOrderId } = await params

		const searchParams = request.nextUrl.searchParams
		const showAll = searchParams.get("showAll") === "true"

		if (!workOrderId) {
			return NextResponse.json({ error: "El ID del libro de obras es requerido" }, { status: 400 })
		}

		const milestones = await prisma.milestone.findMany({
			where: {
				workOrderId,
				...(!showAll && {
					status: {
						in: [MILESTONE_STATUS.IN_PROGRESS, MILESTONE_STATUS.PENDING],
					},
				}),
			},
			include: {
				activities: {
					orderBy: {
						executionDate: "asc",
					},
					select: {
						id: true,
						comments: true,
						activityName: true,
						executionDate: true,
						activityEndTime: true,
						activityStartTime: true,
						_count: {
							select: {
								assignedUsers: true,
							},
						},
					},
				},
			},
			orderBy: {
				order: "asc",
			},
		})

		return NextResponse.json({ milestones })
	} catch (error) {
		console.error("Error fetching milestones:", error)
		return NextResponse.json({ error: "Error al obtener los hitos" }, { status: 500 })
	}
}
