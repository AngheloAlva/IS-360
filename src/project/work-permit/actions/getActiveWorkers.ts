import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function getActiveWorkers() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		return {
			ok: false,
			message: "No se pudo obtener la sesión del usuario",
		}
	}
	try {
		const activeWorkers = await prisma.workPermit.findMany({
			where: {
				status: "ACTIVE",
			},
			include: {
				participants: true,
				otNumber: true,
				user: true,
			},
		})

		return { activeWorkers }
	} catch (error) {
		console.error("Error getting active workers:", error)
		return { error: "Error al obtener los trabajadores activos" }
	}
}
