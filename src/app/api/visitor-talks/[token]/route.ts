import { NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"

type Params = Promise<{
	token: string
}>

export async function GET(request: NextRequest, { params }: { params: Params }) {
	try {
		const { token } = await params

		if (!token) {
			return NextResponse.json(
				{
					ok: false,
					message: "Token es requerido",
				},
				{ status: 400 }
			)
		}

		const visitorTalk = await prisma.visitorTalk.findUnique({
			where: { uniqueToken: token },
			include: {
				company: {
					select: {
						id: true,
						name: true,
						rut: true,
						emails: true,
					},
				},
			},
		})

		if (!visitorTalk) {
			return NextResponse.json(
				{
					ok: false,
					message: "Charla no encontrada",
				},
				{ status: 404 }
			)
		}

		// Check if the talk is still active and not expired
		if (!visitorTalk.isActive) {
			return NextResponse.json(
				{
					ok: false,
					message: "La charla ya no está activa",
				},
				{ status: 410 }
			)
		}

		if (visitorTalk.expiresAt && visitorTalk.expiresAt < new Date()) {
			return NextResponse.json(
				{
					ok: false,
					message: "La charla ha expirado",
				},
				{ status: 410 }
			)
		}

		return NextResponse.json({
			ok: true,
			data: {
				id: visitorTalk.id,
				videoUrl: visitorTalk.videoUrl,
				company: visitorTalk.company,
				expiresAt: visitorTalk.expiresAt,
			},
		})
	} catch (error) {
		console.error("Error in GET /api/visitor-talks/[token]:", error)
		return NextResponse.json(
			{
				ok: false,
				message: "Error interno del servidor",
			},
			{ status: 500 }
		)
	}
}
