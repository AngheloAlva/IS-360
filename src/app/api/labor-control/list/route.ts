import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { ACCESS_ROLE } from "@prisma/client"
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

	const hasAccess = session.user.accessRole === ACCESS_ROLE.ADMIN

	if (!hasAccess) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const searchParams = req.nextUrl.searchParams
		const search = searchParams.get("search") || ""
		const order = searchParams.get("order") as Order
		const page = Number(searchParams.get("page") || 1)
		const limit = Number(searchParams.get("limit") || 15)
		const orderBy = searchParams.get("orderBy") as OrderBy
		const onlyWithReviewRequest = searchParams.get("onlyWithReviewRequest") === "true"

		const skip = (page - 1) * limit

		const [companiesWithLaborControlFolders, total] = await Promise.all([
			prisma.company.findMany({
				where: {
					isActive: true,
					laborControlFolders: {
						some: {},
					},
					...(search
						? {
								OR: [
									{ name: { contains: search, mode: "insensitive" as const } },
									{ rut: { contains: search, mode: "insensitive" as const } },
								],
							}
						: {}),
					...(onlyWithReviewRequest
						? {
								laborControlFolders: {
									some: {
										OR: [
											{
												status: "SUBMITTED",
											},
											{
												documents: {
													some: { status: "SUBMITTED" },
												},
											},
										],
									},
								},
							}
						: {}),
				},
				select: {
					id: true,
					rut: true,
					name: true,
					image: true,
					laborControlFolders: {
						select: {
							_count: {
								select: {
									documents: {
										where: {
											status: "SUBMITTED",
										},
									},
									workerFolders: {
										where: {
											status: "SUBMITTED",
										},
									},
								},
							},
						},
					},
				},
				skip,
				take: limit,
				orderBy: {
					[orderBy]: order,
				},
			}),
			prisma.company.count({
				where: {
					isActive: true,
					laborControlFolders: {
						some: {},
					},
					...(search
						? {
								OR: [
									{ name: { contains: search, mode: "insensitive" as const } },
									{ rut: { contains: search, mode: "insensitive" as const } },
								],
							}
						: {}),
					...(onlyWithReviewRequest
						? {
								laborControlFolders: {
									some: {
										OR: [
											{
												status: "SUBMITTED",
											},
											{
												documents: {
													some: { status: "SUBMITTED" },
												},
											},
										],
									},
								},
							}
						: {}),
				},
			}),
		])

		return NextResponse.json({
			total,
			pages: Math.ceil(total / limit),
			companiesWithLaborControlFolders,
		})
	} catch (error) {
		console.error("[LABOR_CONTROL_FOLDER_GET]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
