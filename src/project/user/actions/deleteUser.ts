"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const deleteUser = async (userId: string) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permission: {
				user: ["delete"],
			},
		},
	})

	if (!hasPermission) {
		return {
			ok: false,
			message: "No tienes permisos para eliminar el usuario",
		}
	}

	try {
		const user = await prisma.user.update({
			where: { id: userId },
			data: { isActive: false },
			select: {
				id: true,
				email: true,
				name: true,
				companyId: true,
			},
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.USERS,
			action: ACTIVITY_TYPE.DELETE,
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
			message: "Usuario eliminado correctamente",
		}
	} catch (error) {
		console.error("[DELETE_USER]", error)
		return {
			ok: false,
			message: "Error al eliminar el usuario",
		}
	}
}

export const deleteExternalUser = async (workerId: string, companyId: string) => {
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
		const worker = await prisma.user.findUnique({
			where: {
				id: workerId,
				companyId,
			},
			select: {
				id: true,
				email: true,
				name: true,
				companyId: true,
			},
		})

		if (!worker) {
			return {
				ok: false,
				message: "Colaborador no encontrado o no tienes permisos para eliminarlo",
			}
		}

		await prisma.user.update({
			where: { id: workerId },
			data: { isActive: false },
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.USERS,
			action: ACTIVITY_TYPE.DELETE,
			entityId: worker.id,
			entityType: "User",
			metadata: {
				email: worker.email,
				name: worker.name,
				companyId: worker.companyId,
			},
		})

		return {
			ok: true,
			message: "Colaborador eliminado correctamente",
		}
	} catch (error) {
		console.error("[DELETE_EXTERNAL_USER]", error)
		return {
			ok: false,
			message: "Error al eliminar el colaborador",
		}
	}
}
