import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

import { SUPPORT_TICKET_STATUS } from "@/generated/prisma/enums"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

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
		const skip = (page - 1) * limit

		const isAdmin = session.user.accessRole === "ADMIN"

		const where = {
			...(search
				? {
						OR: [
							{ ticketNumber: { contains: search, mode: "insensitive" as const } },
							{ title: { contains: search, mode: "insensitive" as const } },
							{ description: { contains: search, mode: "insensitive" as const } },
						],
					}
				: {}),
			...(status !== "all" ? { status: status as SUPPORT_TICKET_STATUS } : {}),
			...(!isAdmin ? { requesterId: session.user.id } : {}),
		}

		const [tickets, total] = await Promise.all([
			prisma.supportTicket.findMany({
				where,
				include: {
					requester: {
						select: {
							id: true,
							name: true,
							email: true,
							image: true,
							company: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					},
					attachments: {
						orderBy: {
							createdAt: "asc",
						},
					},
					notes: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									email: true,
									image: true,
								},
							},
						},
						orderBy: {
							createdAt: "asc",
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
				skip,
				take: limit,
			}),
			prisma.supportTicket.count({
				where,
			}),
		])

		return NextResponse.json({
			tickets,
			total,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("[SUPPORT_GET]", error)
		return NextResponse.json({ error: "Error al obtener tickets de soporte" }, { status: 500 })
	}
}
