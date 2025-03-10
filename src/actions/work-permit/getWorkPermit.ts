"use server"

import prisma from "@/lib/prisma"

export const getWorkPermit = async (workPermitId: string) => {
	try {
		const workPermit = await prisma.workPermit.findUnique({
			where: {
				id: workPermitId,
			},
			include: {
				participants: true,
				otNumber: true,
			},
		})

		return {
			ok: true,
			data: workPermit,
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al obtener el libro de obra",
		}
	}
}

export const getWorkPermits = async (userId: string, limit: number = 10, page: number = 1) => {
	const offset = (page - 1) * limit

	try {
		const totalCount = await prisma.workPermit.count({
			where: {
				userId: userId,
			},
		})

		const workPermits = await prisma.workPermit.findMany({
			where: {
				userId: userId,
			},
			include: {
				participants: true,
				otNumber: {
					select: {
						otNumber: true,
					},
				},
			},
			take: limit,
			skip: offset,
		})

		return {
			ok: true,
			totalCount,
			data: workPermits,
		}
	} catch (error) {
		console.error(error)

		return {
			ok: false,
			message: "Error al obtener los libros de obra",
		}
	}
}
