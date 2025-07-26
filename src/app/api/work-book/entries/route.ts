import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const searchParams = req.nextUrl.searchParams
		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "10")
		const search = searchParams.get("search") || ""
		const workOrderId = searchParams.get("workOrderId")
		const milestone = searchParams.get("milestone")

		if (!workOrderId) {
			return NextResponse.json({ error: "Work Order ID is required" }, { status: 400 })
		}

		const skip = (page - 1) * limit

		const [entries, total, milestones] = await Promise.all([
			prisma.workEntry.findMany({
				where: {
					workOrder: {
						id: workOrderId,
					},
					...(milestone
						? {
								milestone: {
									id: milestone,
								},
							}
						: {}),
					...(search
						? {
								OR: [
									{ activityName: { contains: search, mode: "insensitive" as const } },
									{ comments: { contains: search, mode: "insensitive" as const } },
									{ supervisionComments: { contains: search, mode: "insensitive" as const } },
								],
							}
						: {}),
				},
				select: {
					id: true,
					activityName: true,
					activityStartTime: true,
					activityEndTime: true,
					executionDate: true,
					comments: true,
					createdAt: true,
					entryType: true,
					attachments: true,
					supervisionComments: true,
					safetyObservations: true,
					nonConformities: true,
					inspectorName: true,
					recommendations: true,
					others: true,
					inspectionStatus: true,
					noteStatus: true,
					approvalDate: true,
					createdBy: {
						select: {
							id: true,
							name: true,
							email: true,
							rut: true,
							role: true,
							area: true,
							isSupervisor: true,
						},
					},
					workOrder: {
						select: {
							id: true,
							workName: true,
							status: true,
						},
					},
					assignedUsers: {
						select: {
							id: true,
							name: true,
							email: true,
							rut: true,
							role: true,
							area: true,
							isSupervisor: true,
						},
					},
					milestone: {
						select: {
							id: true,
							name: true,
						},
					},
				},
				skip,
				take: limit,
				orderBy: {
					createdAt: "desc",
				},
				cacheStrategy: {
					ttl: 10,
					swr: 10,
				},
			}),
			prisma.workEntry.count({
				where: {
					workOrder: {
						id: workOrderId,
					},
					...(search
						? {
								OR: [
									{ activityName: { contains: search, mode: "insensitive" as const } },
									{ comments: { contains: search, mode: "insensitive" as const } },
									{ supervisionComments: { contains: search, mode: "insensitive" as const } },
								],
							}
						: {}),
				},
				cacheStrategy: {
					ttl: 10,
					swr: 10,
				},
			}),
			prisma.milestone.findMany({
				where: {
					workOrder: {
						id: workOrderId,
					},
				},
				select: {
					id: true,
					name: true,
				},
				orderBy: {
					order: "asc",
				},
			}),
		])

		return NextResponse.json({
			total,
			entries,
			milestones,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("[WORK_ENTRIES_GET]", error)
		return NextResponse.json({ error: "Error fetching work entries" }, { status: 500 })
	}
}
