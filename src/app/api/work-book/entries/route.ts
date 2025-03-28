import { NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
	try {
		const searchParams = req.nextUrl.searchParams
		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "10")
		const search = searchParams.get("search") || ""
		const workOrderId = searchParams.get("workOrderId")

		if (!workOrderId) {
			return NextResponse.json({ error: "Work Order ID is required" }, { status: 400 })
		}

		const skip = (page - 1) * limit

		const [entries, total] = await Promise.all([
			prisma.workEntry.findMany({
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
				select: {
					id: true,
					activityName: true,
					activityStartTime: true,
					activityEndTime: true,
					executionDate: true,
					comments: true,
					createdAt: true,
					entryType: true,
					// OTC Inspection fields
					supervisionComments: true,
					safetyObservations: true,
					nonConformities: true,
					inspectorName: true,
					recommendations: true,
					others: true,
					// Status fields
					noteStatus: true,
					approvalStatus: true,
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
				},
				skip,
				take: limit,
				orderBy: {
					createdAt: "desc",
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
			}),
		])

		return NextResponse.json({
			entries,
			total,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("[WORK_ENTRIES_GET]", error)
		return NextResponse.json({ error: "Error fetching work entries" }, { status: 500 })
	}
}
