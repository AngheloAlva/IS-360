"use server"

import prisma from "@/lib/prisma"

export const getCompanies = async (limit: number, page: number) => {
	try {
		const companies = await prisma.company.findMany({
			take: limit,
			skip: (page - 1) * limit,
			orderBy: {
				createdAt: "desc",
			},
			include: {
				users: {
					where: {
						isSupervisor: true,
					},
				},
			},
		})

		return {
			ok: true,
			data: companies,
		}
	} catch (error) {
		console.log(error)

		return {
			ok: false,
			message: "Error al cargar las empresas",
		}
	}
}

export const getCompaniesByUserId = async (userId: string) => {
	try {
		const companies = await prisma.company.findMany({
			where: {
				users: {
					some: {
						id: userId,
					},
				},
			},
		})

		return {
			ok: true,
			data: companies,
		}
	} catch (error) {
		console.log(error)

		return {
			ok: false,
			message: "Error al cargar las empresas",
		}
	}
}

export const getCompanyById = async (id: string) => {
	try {
		const company = await prisma.company.findUnique({
			where: {
				id,
			},
			include: {
				users: {
					where: {
						isSupervisor: true,
					},
				},
			},
		})

		return {
			ok: true,
			data: company,
		}
	} catch (error) {
		console.log(error)

		return {
			ok: false,
			message: "Error al cargar la empresa",
		}
	}
}
