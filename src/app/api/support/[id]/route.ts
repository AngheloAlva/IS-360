import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const { id } = await params
		const ticket = await prisma.supportTicket.findUnique({
			where: { id },
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
					where: {
						supportTicketNoteId: null,
					},
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
						attachments: {
							orderBy: {
								createdAt: "asc",
							},
						},
					},
					orderBy: {
						createdAt: "asc",
					},
				},
			},
		})

		if (!ticket) {
			return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 })
		}

		const isAdmin = session.user.accessRole === "ADMIN"
		if (!isAdmin && ticket.requesterId !== session.user.id) {
			return NextResponse.json({ error: "No autorizado" }, { status: 403 })
		}

		return NextResponse.json(ticket)
	} catch (error) {
		console.error("[SUPPORT_BY_ID_GET]", error)
		return NextResponse.json({ error: "Error al obtener ticket" }, { status: 500 })
	}
}
