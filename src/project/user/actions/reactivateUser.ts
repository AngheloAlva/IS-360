"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const reactivateUser = async (userId: string) => {
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
				user: ["update"],
			},
		},
	})

	if (!hasPermission) {
		return {
			ok: false,
			message: "No tienes permisos para reactivar el usuario",
		}
	}

	try {
		const user = await prisma.user.update({
			where: { id: userId },
			data: { isActive: true },
			select: {
				id: true,
				email: true,
				name: true,
				companyId: true,
			},
		})

		logActivity({
			module: MODULES.USERS,
			userId: session.user.id,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: user.id,
			entityType: "User",
			metadata: {
				name: user.name,
				email: user.email,
				companyId: user.companyId,
			},
		})

		return {
			ok: true,
			message: "Usuario reactivado correctamente",
		}
	} catch (error) {
		console.error("[REACTIVATE_USER]", error)
		return {
			ok: false,
			message: "Error al reactivar el usuario",
		}
	}
}
