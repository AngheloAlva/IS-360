import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { getAllowedCompanyIds } from "@/shared/actions/users/get-allowed-companies"
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
		const isAdmin = session.user.accessRole === "ADMIN"
		const userAllowedCompanies = await getAllowedCompanyIds(session.user.id)
		const allowedCompanyIds = Array.from(
			new Set([
				...userAllowedCompanies,
				...(session.user.companyId ? [session.user.companyId] : []),
			])
		)

		if (!isAdmin && !allowedCompanyIds.length) {
			return NextResponse.json({ error: "Sin permisos para acceder a este libro" }, { status: 403 })
		}

		const workOrder = await prisma.workOrder.findFirst({
			where: {
				id: workOrderId,
				deletedAt: null,
				...(!isAdmin && {
					companyId: {
						in: allowedCompanyIds,
					},
				}),
			},
			select: {
				companyId: true,
			},
		})

		if (!workOrder) {
			return NextResponse.json({ error: "Libro de obras no encontrado" }, { status: 404 })
		}

		const companyId = workOrder.companyId

		const [entries, total, milestones] = await Promise.all([
			prisma.workEntry.findMany({
				where: {
					workOrderId,
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
					inspectionStatus: true,
					inspectionComments: {
						select: {
							type: true,
							createdAt: true,
						},
						orderBy: {
							createdAt: "desc",
						},
					},
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
							workBookName: true,
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
							basicFolder: {
								where: companyId
									? {
											startupFolder: {
												companyId,
											},
										}
									: undefined,
								orderBy: {
									updatedAt: "desc",
								},
								take: 1,
								select: {
									status: true,
								},
							},
							workerFolder: {
								where: companyId
									? {
											startupFolder: {
												companyId,
											},
										}
									: undefined,
								orderBy: {
									updatedAt: "desc",
								},
								take: 1,
								select: {
									status: true,
								},
							},
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
			}),
			prisma.workEntry.count({
				where: {
					workOrderId,
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
			prisma.milestone.findMany({
				where: {
					workOrderId,
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

		const normalizedEntries = entries.map((entry) => ({
			...entry,
			assignedUsers: entry.assignedUsers.map((user) => {
				const { basicFolder, workerFolder, ...userData } = user

				return {
					...userData,
					basicFolderStatus: basicFolder.at(0)?.status ?? null,
					workerFolderStatus: workerFolder.at(0)?.status ?? null,
				}
			}),
		}))

		return NextResponse.json({
			total,
			entries: normalizedEntries,
			milestones,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("[WORK_ENTRIES_GET]", error)
		return NextResponse.json({ error: "Error fetching work entries" }, { status: 500 })
	}
}
