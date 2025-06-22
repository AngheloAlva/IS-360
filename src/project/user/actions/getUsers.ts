"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const getUsers = async (limit: number, page: number) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const users = await prisma.user.findMany({
			take: limit,
			skip: (page - 1) * limit,
			orderBy: {
				createdAt: "desc",
			},
			cacheStrategy: {
				ttl: 10,
			},
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.USERS,
			action: ACTIVITY_TYPE.VIEW,
			entityId: "all",
			entityType: "User",
			metadata: {
				page,
				limit,
				count: users.length,
			},
		})

		return {
			ok: true,
			data: users,
		}
	} catch (error) {
		console.error("[GET_USERS]", error)

		return {
			ok: false,
			message: "Error al cargar los usuarios",
		}
	}
}

export const getUsersByCompanyId = async (companyId: string) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const users = await prisma.user.findMany({
			where: {
				companyId,
			},
			cacheStrategy: {
				ttl: 10,
			},
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.USERS,
			action: ACTIVITY_TYPE.VIEW,
			entityId: companyId,
			entityType: "Company",
			metadata: {
				companyId,
				count: users.length,
			},
		})

		return {
			ok: true,
			data: users,
		}
	} catch (error) {
		console.error("[GET_USERS_BY_COMPANY]", error)

		return {
			ok: false,
			message: "Error al cargar los usuarios",
		}
	}
}

export const getUserById = async (userId: string) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
			cacheStrategy: {
				ttl: 10,
			},
		})

		if (!user) {
			return {
				ok: false,
				message: "Usuario no encontrado",
			}
		}

		logActivity({
			userId: session.user.id,
			module: MODULES.USERS,
			action: ACTIVITY_TYPE.VIEW,
			entityId: user.id,
			entityType: "User",
			metadata: {
				email: user.email,
				name: user.name,
				companyId: user.companyId,
			},
		})

		return {
			ok: true,
			data: user,
		}
	} catch (error) {
		console.error("[GET_USER_BY_ID]", error)

		return {
			ok: false,
			message: "Error al cargar el usuario",
		}
	}
}

export const getOtcUsers = async (limit: number, page: number) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const users = await prisma.user.findMany({
			take: limit,
			skip: (page - 1) * limit,
			where: {
				accessRole: {
					in: ["ADMIN"],
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			cacheStrategy: {
				ttl: 10,
			},
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.USERS,
			action: ACTIVITY_TYPE.VIEW,
			entityId: "otc",
			entityType: "User",
			metadata: {
				page,
				limit,
				count: users.length,
			},
		})

		return {
			ok: true,
			data: users,
		}
	} catch (error) {
		console.error("[GET_OTC_USERS]", error)

		return {
			ok: false,
			message: "Error al cargar los usuarios",
		}
	}
}

export const getUsersByWorkOrderId = async (workOrderId: string) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const company = await prisma.company.findFirst({
			where: {
				workOrders: {
					some: {
						id: workOrderId,
					},
				},
			},
			select: {
				id: true,
			},
			cacheStrategy: {
				ttl: 10,
			},
		})

		if (!company) {
			return {
				ok: false,
				message: "No se encontró la empresa",
			}
		}

		const users = await prisma.user.findMany({
			where: {
				companyId: company.id,
			},
			cacheStrategy: {
				ttl: 10,
			},
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.USERS,
			action: ACTIVITY_TYPE.VIEW,
			entityId: workOrderId,
			entityType: "WorkOrder",
			metadata: {
				workOrderId,
				companyId: company.id,
				count: users.length,
			},
		})

		return {
			ok: true,
			data: users,
		}
	} catch (error) {
		console.error("[GET_USERS_BY_WORK_ORDER]", error)

		return {
			ok: false,
			message: "Error al cargar los usuarios",
		}
	}
}
