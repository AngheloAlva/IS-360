import { NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: req.headers,
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const { id } = await params

		const workPermit = await prisma.workPermit.findUnique({
			where: {
				id,
			},
			include: {
				otNumber: {
					select: {
						otNumber: true,
						workName: true,
					},
				},
				user: {
					select: {
						id: true,
						name: true,
						rut: true,
					},
				},
				company: {
					select: {
						id: true,
						name: true,
						rut: true,
					},
				},
				_count: {
					select: {
						participants: true,
						attachments: true,
					},
				},
				participants: {
					select: {
						id: true,
						name: true,
					},
				},
				attachments: {
					select: {
						id: true,
						name: true,
						url: true,
						type: true,
						size: true,
						uploadedAt: true,
						uploadedBy: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
			},
			cacheStrategy: {
				ttl: 30,
				swr: 30,
			},
		})

		return NextResponse.json(workPermit)
	} catch (error) {
		console.error("[WORK_PERMIT_GET]", error)
		return NextResponse.json({ error: "Error fetching work permit" }, { status: 500 })
	}
}
