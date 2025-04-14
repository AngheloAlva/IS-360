import prisma from "@/lib/prisma"

export async function getActiveWorkers() {
	try {
		const activeWorkers = await prisma.workPermit.findMany({
			where: {
				status: "ACTIVE",
				endDate: {
					gte: new Date(),
				},
			},
			include: {
				participants: true,
				otNumber: true,
				user: true,
			},
			orderBy: {
				initDate: "desc",
			},
			cacheStrategy: {
				ttl: 60,
				swr: 10,
			},
		})

		return { activeWorkers }
	} catch (error) {
		console.error("Error getting active workers:", error)
		return { error: "Error al obtener los trabajadores activos" }
	}
}
