"use server"

import prisma from "@/lib/prisma"

export const getCompanies = async (
	limit: number,
	page: number,
	haveSupervisor: boolean = false
) => {
	try {
		const companies = await prisma.company.findMany({
			take: limit,
			skip: (page - 1) * limit,
			orderBy: {
				createdAt: "desc",
			},
			where: {
				...(haveSupervisor
					? {
							users: {
								some: {
									isSupervisor: true,
								},
							},
						}
					: {}),
			},
			include: {
				users: {
					where: {
						isSupervisor: true,
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

export const getCompanyByUserId = async (userId: string) => {
	try {
		const company = await prisma.company.findFirst({
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
			data: company,
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
