import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { WORK_ORDER_STATUS } from "@prisma/client"

export async function GET(req: NextRequest) {
	try {
		const searchParams = req.nextUrl.searchParams
		const otStatus = searchParams.get("otStatus")
		const search = searchParams.get("search") || ""
		const withOtActive = searchParams.get("withOtActive") === "true"

		const companiesWithStartupFolders = await prisma.company.findMany({
			where: {
				...(search
					? {
							OR: [
								{ name: { contains: search, mode: "insensitive" as const } },
								{ rut: { contains: search, mode: "insensitive" as const } },
							],
						}
					: {}),
				...(withOtActive
					? {
							workOrders: {
								some: {
									status: {
										in: [
											WORK_ORDER_STATUS.PLANNED,
											WORK_ORDER_STATUS.IN_PROGRESS,
											WORK_ORDER_STATUS.PENDING,
										],
									},
								},
							},
						}
					: {}),
				...(otStatus
					? {
							workOrders: {
								some: {
									status: otStatus as WORK_ORDER_STATUS,
								},
							},
						}
					: {}),
			},
			include: {
				StartupFolders: {
					select: {
						id: true,
						name: true,
						createdAt: true,
						safetyAndHealthFolders: {
							include: {
								documents: {
									orderBy: {
										name: "asc",
									},
								},
							},
							orderBy: {
								createdAt: "asc",
							},
						},
						environmentalFolders: {
							include: {
								documents: {
									orderBy: {
										name: "asc",
									},
								},
							},
							orderBy: {
								createdAt: "asc",
							},
						},
						workersFolders: {
							include: {
								documents: {
									orderBy: {
										name: "asc",
									},
								},
								worker: {
									select: {
										id: true,
										name: true,
										email: true,
									},
								},
							},
							orderBy: {
								worker: {
									name: "asc",
								},
							},
						},
						vehiclesFolders: {
							include: {
								documents: {
									orderBy: {
										name: "asc",
									},
								},
								vehicle: true,
							},
						},
					},
				},
			},
			cacheStrategy: {
				ttl: 10,
			},
		})

		if (!companiesWithStartupFolders) {
			return new NextResponse("General startup folder not found", { status: 404 })
		}

		return NextResponse.json(companiesWithStartupFolders)
	} catch (error) {
		console.error("[GENERAL_STARTUP_FOLDER_GET]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
