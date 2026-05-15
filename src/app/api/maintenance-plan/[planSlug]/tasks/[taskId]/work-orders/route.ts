import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
	req: NextRequest,
	{
		params,
	}: {
		params: Promise<{
			planSlug: string
			taskId: string
		}>
	}
): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	const { planSlug, taskId } = await params
	const searchParams = req.nextUrl.searchParams
	const limit = Math.max(1, Number.parseInt(searchParams.get("limit") ?? "5", 10) || 5)
	const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1)
	const skip = (page - 1) * limit

	try {
		const task = await prisma.maintenancePlanTask.findFirst({
			where: {
				id: taskId,
				isActive: true,
				maintenancePlan: {
					slug: planSlug,
					isActive: true,
				},
			},
			select: {
				id: true,
			},
		})

		if (!task) {
			return NextResponse.json({
				message: "Tarea no encontrada",
				status: 404,
			})
		}

		const where = {
			maintenancePlanTaskId: taskId,
			deletedAt: null,
		}

		const [workOrders, total] = await Promise.all([
			prisma.workOrder.findMany({
				where,
				select: {
					id: true,
					otNumber: true,
					status: true,
					createdAt: true,
					programDate: true,
					estimatedDays: true,
					estimatedHours: true,
					workRequest: true,
					workDescription: true,
					capex: true,
					type: true,
					priority: true,
					company: {
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
					supervisor: {
						select: {
							id: true,
							name: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
				take: limit,
				skip,
			}),
			prisma.workOrder.count({ where }),
		])

		const timelineRaw = await prisma.workOrder.findMany({
			where,
			select: {
				id: true,
				otNumber: true,
				status: true,
				programDate: true,
				createdAt: true,
			},
			orderBy: {
				programDate: "desc",
			},
			take: 12,
		})

		const timeline = timelineRaw.reverse()

		return NextResponse.json({
			workOrders,
			timeline,
			total,
			pages: Math.ceil(total / limit),
			page,
			limit,
		})
	} catch (error) {
		console.error("[MAINTENANCE_PLAN_TASK_WORK_ORDERS_GET]", error)
		return NextResponse.json({
			message: "Internal Error",
			status: 500,
		})
	}
}
