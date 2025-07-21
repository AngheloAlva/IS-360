import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

import type { WORK_REQUEST_STATUS } from "@prisma/client"

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
				include: {
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
							location: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
				skip,
				take: limit,
				cacheStrategy: {
					ttl: 10,
				},
			}),
			prisma.workRequest.count({
				where,
				cacheStrategy: {
					ttl: 15,
				},
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
