import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { SAFETY_TALK_CATEGORY } from "@/generated/prisma/enums"

const ALL_CATEGORIES = [
	SAFETY_TALK_CATEGORY.VISITOR,
	SAFETY_TALK_CATEGORY.VISITOR_TRM,
	SAFETY_TALK_CATEGORY.IRL,
]

export async function GET(req: NextRequest, { params }: { params: Promise<{ workerId: string }> }) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user) {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 })
		}

		const { workerId } = await params

		const worker = await prisma.user.findUnique({
			where: { id: workerId },
			select: {
				id: true,
				name: true,
				rut: true,
			},
		})

		if (!worker) {
			return NextResponse.json({ error: "Trabajador no encontrado" }, { status: 404 })
		}

		const safetyTalks = await prisma.userSafetyTalk.findMany({
			where: {
				userId: workerId,
			},
			select: {
				id: true,
				category: true,
				status: true,
				score: true,
				completedAt: true,
				expiresAt: true,
				currentAttempts: true,
				lastAttemptAt: true,
				manuallyApproved: true,
				inPersonSessionDate: true,
			},
			orderBy: {
				category: "asc",
			},
		})

		// Crear un mapa de las charlas existentes por categoría
		const talksMap = new Map(safetyTalks.map((talk) => [talk.category, talk]))

		// Crear array con todas las categorías, rellenando las que no existen
		const allSafetyTalks = ALL_CATEGORIES.map((category) => {
			const existingTalk = talksMap.get(category)
			if (existingTalk) {
				return existingTalk
			}
			// Retornar un objeto placeholder para categorías no iniciadas
			return {
				id: `not-started-${category}`,
				category,
				status: "NOT_STARTED",
				score: null,
				completedAt: null,
				expiresAt: null,
				currentAttempts: 0,
				lastAttemptAt: null,
				manuallyApproved: false,
				inPersonSessionDate: null,
			}
		})

		return NextResponse.json({
			worker,
			safetyTalks: allSafetyTalks,
		})
	} catch (error) {
		console.error("[SAFETY_TALKS_BY_WORKER]", error)
		return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
	}
}
