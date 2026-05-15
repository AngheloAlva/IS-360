import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

import type { WORK_REQUEST_STATUS } from "@/generated/prisma/enums"

const ALLOWED_SORT_FIELDS = [
	"requestNumber",
	"requestDate",
	"status",
	"isUrgent",
	"workType",
	"createdAt",
] as const

type WorkRequestSortBy = (typeof ALLOWED_SORT_FIELDS)[number]
type SortOrder = "asc" | "desc"

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
		const status = searchParams.get("status") || "all"
		const isUrgent = searchParams.get("isUrgent") as "true" | "false" | "all"
		const include = searchParams.get("include") === "full" ? "full" : "table"
		const requestedSortBy = searchParams.get("sortBy") as WorkRequestSortBy | null
		const requestedSortOrder = searchParams.get("sortOrder") as SortOrder | null
		const sortBy: WorkRequestSortBy =
			requestedSortBy && ALLOWED_SORT_FIELDS.includes(requestedSortBy)
				? requestedSortBy
				: "createdAt"
		const sortOrder: SortOrder = requestedSortOrder === "asc" ? "asc" : "desc"

		const skip = (page - 1) * limit

		const where = {
			...(search
				? {
						OR: [
							{ requestNumber: { contains: search, mode: "insensitive" as const } },
							{ description: { contains: search, mode: "insensitive" as const } },
						],
					}
				: {}),
			...(status !== "all" ? { status: status as WORK_REQUEST_STATUS } : {}),
			...(isUrgent === "true" ? { isUrgent: true } : {}),
			...(isUrgent === "false" ? { isUrgent: false } : {}),
		}

		const [workRequests, total] = await Promise.all([
			prisma.workRequest.findMany({
				where,
				include:
					include === "full"
						? {
								user: {
									select: {
										name: true,
										email: true,
										image: true,
										company: {
											select: {
												name: true,
											},
										},
									},
								},
								operator: {
									select: {
										name: true,
										email: true,
										image: true,
									},
								},
								attachments: true,
								comments: {
									include: {
										user: {
											select: {
												name: true,
												email: true,
												image: true,
											},
										},
									},
								},
								equipments: {
									select: {
										id: true,
										name: true,
										tag: true,
										location: { select: { id: true, name: true, path: true } },
									},
								},
							}
						: {
								user: {
									select: {
										name: true,
										email: true,
										image: true,
										company: {
											select: {
												name: true,
											},
										},
									},
								},
								operator: {
									select: {
										name: true,
										email: true,
										image: true,
									},
								},
								equipments: {
									select: {
										id: true,
										name: true,
										tag: true,
										location: { select: { id: true, name: true, path: true } },
									},
								},
							},
				orderBy: {
					[sortBy]: sortOrder,
				},
				skip,
				take: limit,
			}),
			prisma.workRequest.count({
				where,
			}),
		])

		return NextResponse.json({
			workRequests,
			total,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("Error al obtener las solicitudes de trabajo:", error)
		return NextResponse.json(
			{ error: "Error al obtener las solicitudes de trabajo" },
			{ status: 500 }
		)
	}
}
