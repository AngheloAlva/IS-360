"use server"

import prisma from "@/lib/prisma"

export const getUsers = async (limit: number, page: number) => {
	try {
		const users = await prisma.user.findMany({
			take: limit,
			skip: (page - 1) * limit,
			orderBy: {
				createdAt: "desc",
			},
		})

		return {
			ok: true,
			data: users,
		}
	} catch (error) {
		console.log(error)

		return {
			ok: false,
			message: "Error al cargar los usuarios",
		}
	}
}
