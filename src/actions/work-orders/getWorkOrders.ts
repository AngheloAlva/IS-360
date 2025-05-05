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
			cacheStrategy: {
				ttl: 60,
				swr: 10,
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
			cacheStrategy: {
				ttl: 60,
				swr: 10,
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

export const getWorkOrderById = async (id: string) => {
	try {
		const work = await prisma.workOrder.findUnique({
			where: {
				id,
			},
			include: {
				workEntries: {
					include: {
						createdBy: true,
						assignedUsers: true,
					},
				},
				company: {
					select: {
						name: true,
						rut: true,
					},
				},
				supervisor: {
					select: {
						id: true,
						rut: true,
						name: true,
						phone: true,
					},
				},
				responsible: {
					select: {
						id: true,
						rut: true,
						name: true,
						phone: true,
					},
				},
				equipment: true,
				milestones: {
					select: {
						startDate: true,
					},
				},
				_count: {
					select: {
						milestones: true,
					},
				},
			},
			cacheStrategy: {
				ttl: 60,
				swr: 10,
			},
		})

		return {
			ok: true,
			data: work,
		}
	} catch (error) {
		console.log(error)

		return {
			message: "Error al cargar la orden de trabajo",
			ok: false,
		}
	}
}
