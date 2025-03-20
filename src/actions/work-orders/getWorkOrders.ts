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
				responsible: {
					select: {
						name: true,
					},
				},
				supervisor: {
					select: {
						name: true,
					},
				},
				company: {
					select: {
						name: true,
					},
				},
				equipment: {
					select: {
						name: true,
					},
				},
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

export const getWorkOrdersByCompanyId = async (companyId: string) => {
	try {
		const workOrders = await prisma.workOrder.findMany({
			where: {
				companyId,
			},
			include: {
				supervisor: {
					select: {
						name: true,
						id: true,
						phone: true,
					},
				},
				responsible: {
					select: {
						name: true,
						id: true,
						phone: true,
					},
				},
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
