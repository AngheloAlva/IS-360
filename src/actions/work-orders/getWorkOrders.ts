"use server"

import prisma from "@/lib/prisma"

export const getWorkOrders = async (limit: number, page: number) => {
	try {
		const workOrders = await prisma.workOrder.findMany({
			take: limit,
			skip: (page - 1) * limit,
			orderBy: {
				createdAt: "desc",
			},
			include: {
				responsible: true,
			},
		})

		return {
			ok: true,
			data: workOrders,
		}
	} catch (error) {
		console.log(error)

		return {
			message: "Error al cargar las ordenes de trabajo",
			ok: false,
		}
	}
}
