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

export const getUsersByCompanyId = async (companyId: string) => {
	try {
		const users = await prisma.user.findMany({
			where: {
				companyId,
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

export const getUserById = async (userId: string) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
		})

		return {
			ok: true,
			data: user,
		}
	} catch (error) {
		console.log(error)

		return {
			ok: false,
			message: "Error al cargar el usuario",
		}
	}
}

export const getInternalUsers = async (limit: number, page: number) => {
	try {
		const users = await prisma.user.findMany({
			take: limit,
			skip: (page - 1) * limit,
			where: {
				role: {
					in: ["ADMIN", "SUPERADMIN", "USER"],
				},
			},
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
