import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ companyId: string }> }
) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		})

		if (!session?.user) {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 })
		}

		const { companyId } = await params

		const employees = await prisma.user.findMany({
			where: {
				companyId,
				isActive: true,
			},
			select: {
				id: true,
				name: true,
				email: true,
				rut: true,
				safetyTalks: {
					where: {
						category: "IRL",
					},
					select: {
						id: true,
						expiresAt: true,
						score: true,
						completedAt: true,
						inPersonSessionDate: true,
						status: true,
					},
				},
			},
			orderBy: {
				name: "asc",
			},
		})

		return NextResponse.json({ employees })
	} catch (error) {
		console.error("Error al obtener empleados:", error)
		return NextResponse.json({ error: "Error al obtener los empleados" }, { status: 500 })
	}
}
