import { NextRequest, NextResponse } from "next/server"
import { WORK_ORDER_STATUS } from "@prisma/client"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

export async function GET(req: NextRequest): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const searchParams = req.nextUrl.searchParams
		const otStatus = searchParams.get("otStatus")
		const search = searchParams.get("search") || ""
		const order = searchParams.get("order") as Order
		const orderBy = searchParams.get("orderBy") as OrderBy
		const withOtActive = searchParams.get("withOtActive") === "true"
		const onlyWithReviewRequest = searchParams.get("onlyWithReviewRequest") === "true"

		const companiesWithStartupFolders = await prisma.company.findMany({
			where: {
				isActive: true,
				...(search
					? {
							OR: [
								{ name: { contains: search, mode: "insensitive" as const } },
								{ rut: { contains: search, mode: "insensitive" as const } },
								{
									StartupFolders: {
										some: { name: { contains: search, mode: "insensitive" as const } },
									},
								},
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
				...(onlyWithReviewRequest
					? {
							StartupFolders: {
								some: {
									OR: [
										{
											safetyAndHealthFolders: {
												some: {
													status: "SUBMITTED",
												},
											},
										},
										{
											environmentalFolders: {
												some: {
													status: "SUBMITTED",
												},
											},
										},
										{
											environmentFolders: {
												some: {
													status: "SUBMITTED",
												},
											},
										},
										{
											techSpecsFolders: {
												some: {
													status: "SUBMITTED",
												},
											},
										},
										{
											basicFolders: {
												some: {
													status: "SUBMITTED",
												},
											},
										},
										{
											workersFolders: {
												some: {
													status: "SUBMITTED",
												},
											},
										},
										{
											vehiclesFolders: {
												some: {
													status: "SUBMITTED",
												},
											},
										},
									],
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
						status: true,
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
						basicFolders: {
							include: {
								documents: {
									orderBy: {
										name: "asc",
									},
								},
							},
						},
					},
				},
			},
			orderBy: {
				[orderBy]: order,
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
