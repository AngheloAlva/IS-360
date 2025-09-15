"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES, LOCKOUT_PERMIT_STATUS } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { CloseLockoutPermitSchema } from "@/project/lockout-permit/schemas/close-lockout-permit.schema"

export const closeLockoutPermit = async ({ id }: CloseLockoutPermitSchema) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		return {
			ok: false,
			message: "No se pudo obtener la sesión del usuario",
		}
	}

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permission: {
				lockoutPermit: ["update"],
			},
		},
	})

	if (!hasPermission.success) {
		return {
			ok: false,
			message: "No tienes permisos para cerrar solicitudes de bloqueo",
		}
	}

	try {
		const lockoutPermit = await prisma.lockoutPermit.update({
			where: { id },
			data: {
				status: LOCKOUT_PERMIT_STATUS.COMPLETED,
			},
			include: {
				company: {
					select: {
						name: true,
					},
				},
				requestedBy: {
					select: {
						name: true,
						id: true,
					},
				},
				otNumberRef: {
					select: {
						otNumber: true,
					},
				},
			},
		})

		logActivity({
			userId: session.user.id,
			entityId: lockoutPermit.id,
			entityType: "LockoutPermit",
			action: ACTIVITY_TYPE.COMPLETE,
			module: MODULES.LOCKOUT_PERMITS,
		})

		return {
			ok: true,
			message: "Solicitud de bloqueo completada exitosamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al completar la solicitud de bloqueo",
		}
	}
}
