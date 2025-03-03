"use server"

import prisma from "@/lib/prisma"

export const getWorkBook = async (workBookId: string) => {
	try {
		const workBook = await prisma.workBook.findUnique({
			where: {
				id: workBookId,
			},
		})

		return {
			ok: true,
			data: workBook,
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al obtener el libro de obra",
		}
	}
}

export const getWorkBooks = async (userId: string, limit: number = 10, page: number = 1) => {
	const offset = (page - 1) * limit

	try {
		const totalCount = await prisma.workBook.count({
			where: {
				userId: userId,
			},
		})

		const workBooks = await prisma.workBook.findMany({
			where: {
				userId: userId,
			},
			take: limit,
			skip: offset,
		})

		return {
			ok: true,
			totalCount,
			data: workBooks,
		}
	} catch (error) {
		console.error(error)

		return {
			ok: false,
			message: "Error al obtener los libros de obra",
		}
	}
}
