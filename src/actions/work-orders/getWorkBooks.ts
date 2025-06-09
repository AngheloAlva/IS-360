"use server"

import prisma from "@/lib/prisma"

export const getWorkBooks = async (limit: number, page: number) => {
	try {
		const workBooks = await prisma.workOrder.findMany({
			where: {
				isWorkBook: true,
			},
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
				ttl: 10,
			},
		})

		return {
			ok: true,
			data: workBooks,
		}
	} catch (error) {
		console.log(error)

		return {
			message: "Error al cargar las ordenes de trabajo",
			ok: false,
		}
	}
}

export const getWorkBooksByCompanyId = async (companyId: string, limit: number, page: number) => {
	try {
		const workBooks = await prisma.workOrder.findMany({
			where: {
				companyId,
				isWorkBook: true,
			},
			take: limit,
			skip: (page - 1) * limit,
			orderBy: {
				createdAt: "desc",
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
				ttl: 10,
			},
		})

		return {
			ok: true,
			data: workBooks,
		}
	} catch (error) {
		console.log(error)

		return {
			message: "Error al cargar las ordenes de trabajo",
			ok: false,
		}
	}
}

export const getWorkBooksByCompanyIdLikeBook = async (
	companyId: string,
	limit: number,
	page: number
) => {
	try {
		const workBooks = await prisma.workOrder.findMany({
			where: {
				companyId,
				isWorkBook: true,
				workName: {
					not: null,
				},
			},
			take: limit,
			skip: (page - 1) * limit,
			orderBy: {
				createdAt: "desc",
			},
			include: {
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
				ttl: 10,
			},
		})

		return {
			ok: true,
			data: workBooks,
		}
	} catch (error) {
		console.log(error)

		return {
			message: "Error al cargar las ordenes de trabajo",
			ok: false,
		}
	}
}
