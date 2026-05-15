import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user) {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 })
		}

		// Total de charlas realizadas
		const totalSafetyTalks = await prisma.userSafetyTalk.count()

		// Charlas aprobadas
		const approvedSafetyTalks = await prisma.userSafetyTalk.count({
			where: {
				status: "MANUALLY_APPROVED",
			},
		})

		// Charlas pendientes de aprobación
		const pendingApprovalSafetyTalks = await prisma.userSafetyTalk.count({
			where: {
				status: "PASSED",
			},
		})

		// Charlas expiradas
		const expiredSafetyTalks = await prisma.userSafetyTalk.count({
			where: {
				expiresAt: {
					lt: new Date(),
				},
			},
		})

		return NextResponse.json({
			totalSafetyTalks,
			approvedSafetyTalks,
			pendingApprovalSafetyTalks,
			expiredSafetyTalks,
		})
	} catch (error) {
		console.error("[SAFETY_TALKS_STATS]", error)
		return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
	}
}
