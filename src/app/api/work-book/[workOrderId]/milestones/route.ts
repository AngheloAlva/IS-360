import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ workOrderId: string }> }
) {
	try {
		const { workOrderId } = await params

		// Validate workOrderId
		if (!workOrderId) {
			return NextResponse.json({ error: "El ID del libro de obras es requerido" }, { status: 400 })
		}

		// Fetch milestones with their tasks for the given workOrderId
		const milestones = await prisma.milestone.findMany({
			where: {
				workOrderId,
			},
			include: {
				tasks: {
					orderBy: {
						order: "asc",
					},
				},
			},
			orderBy: {
				order: "asc",
			},
		})

		// Proporcionar valores predeterminados para los nuevos campos
		const enrichedMilestones = milestones.map((milestone) => ({
			...milestone,
			tasks: milestone.tasks.map((task) => ({
				...task,
				// Proporcionar valores predeterminados para los nuevos campos
				currentProgress: task.isCompleted ? 100 : 0,
				completedHours: 0,
				weight: 1,
				autoComplete: true,
			})),
		}))

		return NextResponse.json({ milestones: enrichedMilestones })
	} catch (error) {
		console.error("Error fetching milestones:", error)
		return NextResponse.json({ error: "Error al obtener los hitos" }, { status: 500 })
	}
}
