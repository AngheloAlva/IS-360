import prisma from "@/lib/prisma"

export async function getActiveWorkers() {
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
			cacheStrategy: {
				ttl: 10,
			},
		})

		return { activeWorkers }
	} catch (error) {
		console.error("Error getting active workers:", error)
		return { error: "Error al obtener los trabajadores activos" }
	}
}
